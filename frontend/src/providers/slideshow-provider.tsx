import { zodResolver } from "@hookform/resolvers/zod";
import { createContext, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";
import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { second } from "@/types/branded-types";
import type { SlideshowConfiguration, SlideshowConfigurationResponse } from "@/types/slideshow";
import type { AddToastFn } from "@/types/toast";
import { ToastType } from "@/types/toast";
import { defaultSlideshowConfiguration } from "@/types/slideshow";
import { updateSlideshow } from "@/api/slideshow-api";
import { constructUrl } from "@/lib/utils";

interface SlideshowContextDefaults {
  slideshowConfiguration: SlideshowConfiguration;
  slideshowForm: UseFormReturn<SlideshowFormInput, unknown, SlideshowFormOutput> | null;
  slideshowDataLoading: boolean;
  submitSlideshowConfiguration: (configuration?: SlideshowConfiguration, successMessage?: string) => Promise<boolean>;
}

// Placeholder implementation
const SlideshowContext = createContext<SlideshowContextDefaults>({
  slideshowConfiguration: defaultSlideshowConfiguration,
  slideshowForm: null,
  slideshowDataLoading: true,
  submitSlideshowConfiguration: async () => new Promise<boolean>(() => false),
})

export const useSlideshow = () => useContext(SlideshowContext);

export const SlideshowProvider = ({children, addToast}: { children: ReactNode, addToast: AddToastFn }) => {
  const [slideshowConfig, setSlideshowConfig] = useState<SlideshowConfiguration>(defaultSlideshowConfiguration);

  const slideshowForm = useForm<SlideshowFormInput, unknown, SlideshowFormOutput>({
    resolver: zodResolver(slideshowFormSchema),
    defaultValues: defaultSlideshowConfiguration
  });

  const {
    data: slideshowData,
    isLoading: slideshowDataLoading
  } = useSWR<SlideshowConfigurationResponse>(constructUrl("slideshow"), {revalidateOnReconnect: true});

  useEffect(() => {
    if (slideshowData) {
      const updatedConfig = {
        changeDelay: slideshowData.change_delay as second,
        images: slideshowData.images
      };
      setSlideshowConfig(updatedConfig);
      slideshowForm.reset(updatedConfig)
    }
  }, [slideshowData, slideshowForm]);

  async function submitSlideshowConfiguration(submittedConfig?: SlideshowConfiguration, successMessage?: string): Promise<boolean> {
    const updatedConfig: SlideshowConfiguration = submittedConfig ?? {
      changeDelay: slideshowForm.getValues('changeDelay') as second,
      images: slideshowForm.getValues('images')
    }
    let success = false;

    const res = await updateSlideshow({...updatedConfig}, (message: string) =>
      addToast(`Error updating slideshow configuration - ${message}`, {
        type: ToastType.ERROR,
      })
    );
    if (res) {
      const message = successMessage ?? "Successfully submitted slideshow configuration"
      addToast(message, {
        type: ToastType.SUCCESS,
      });
      setSlideshowConfig(updatedConfig);
      slideshowForm.reset(updatedConfig)
      success = true;
    }

    return success;
  }

  return (
    <SlideshowContext.Provider value={{
      slideshowConfiguration: slideshowConfig,
      slideshowForm: slideshowForm,
      slideshowDataLoading,
      submitSlideshowConfiguration,
    }}>
      {children}
    </SlideshowContext.Provider>
  )
}

export const slideshowFormSchema = z.object({
  changeDelay: z.number().transform(value => value as second),
  images: z.array(z.string())
})

export type SlideshowFormInput = z.input<typeof slideshowFormSchema>;
export type SlideshowFormOutput = z.infer<typeof slideshowFormSchema>;

