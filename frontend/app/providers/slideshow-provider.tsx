import {
  defaultSlideshowConfiguration,
  SlideshowConfiguration,
  SlideshowConfigurationResponse,
  updateSlideshow
} from "@/lib/slideshow-service";
import {createContext, ReactNode, SetStateAction, useContext, useEffect, useState} from "react";
import {second} from "@/lib/branded-types";
import useSWR from "swr";
import {constructUrl} from "@/lib/utils";
import {AddToastFn, ToastType} from "@/app/providers/toast-provider";
import {useForm, UseFormReturn} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

interface SlideshowContextDefaults {
  slideshowConfiguration: SlideshowConfiguration;
  slideshowForm: UseFormReturn<SlideshowForm> | null;
  slideshowDataLoading: boolean;
  submitSlideshowConfiguration: (configuration: SlideshowConfiguration) => Promise<boolean>;
}

// Placeholder implementation
const SlideshowContext = createContext<SlideshowContextDefaults>({
  slideshowConfiguration: defaultSlideshowConfiguration,
  slideshowForm: null,
  slideshowDataLoading: true,
  submitSlideshowConfiguration: async (configuration: SlideshowConfiguration) => false,
})

export const useSlideshow = () => useContext(SlideshowContext);

export const SlideshowProvider = ({children, addToast}: { children: ReactNode, addToast: AddToastFn }) => {
  const [slideshowConfig, setSlideshowConfig] = useState<SlideshowConfiguration>(defaultSlideshowConfiguration);

  const slideshowForm = useForm<SlideshowForm>({
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
  }, [slideshowData]);

  async function submitSlideshowConfiguration(updatedConfig: SlideshowConfiguration): Promise<boolean> {
    let success = false;
    const res = await updateSlideshow({...updatedConfig}, (message: string) =>
      addToast(`Error updating slideshow configuration - ${message}`, {
        type: ToastType.ERROR,
      })
    );
    if (res) {
      addToast("Successfully submitted slideshow configuration", {
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
      submitSlideshowConfiguration
    }}>
      {children}
    </SlideshowContext.Provider>
  )
}

export const slideshowFormSchema = z.object({
  changeDelay: z.number().transform(value => value as second),
  images: z.array(z.string())
})

export type SlideshowForm = z.infer<typeof slideshowFormSchema>;

