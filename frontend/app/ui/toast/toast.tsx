"use client";
import { ToastType, useToast } from "../../providers/toast-provider";
import { CloseIcon } from "../icons/close";
import { CheckIcon } from "../icons/check";
import { ErrorIcon } from "../icons/error";
import { InformationIcon } from "../icons/information";
import "./toast.css";

export default function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="flex flex-col fixed bottom-5 inset-x-0 items-center md:inset-x-auto md:items-end md:right-5">
      {toasts.map((toast) => (
        <div
          id="toast"
          key={toast.id}
          role="alert"
          className="w-full max-w-xs p-4 mb-4  bg-white rounded-lg shadow dark:bg-gray-800"
        >
          <div className="flex items-center w-full max-w-xs text-gray-500  dark:text-gray-400 ">
            {(() => {
              switch (toast?.options?.type) {
                // Icon dependant on toast type
                case ToastType.INFO:
                  return (
                    <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-violet-100 rounded-lg dark:bg-violet-800 dark:text-violet-200">
                      <InformationIcon></InformationIcon>
                      <span className="sr-only">Info icon</span>
                    </div>
                  );
                case ToastType.SUCCESS:
                  return (
                    <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                      <CheckIcon></CheckIcon>
                      <span className="sr-only">Check icon</span>
                    </div>
                  );
                case ToastType.ERROR:
                  return (
                    <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
                      <ErrorIcon></ErrorIcon>
                      <span className="sr-only">Error icon</span>
                    </div>
                  );
                default:
                  return (
                    <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-slate-500 bg-slate-100 rounded-lg dark:bg-slate-800 dark:text-slate-200">
                      <InformationIcon></InformationIcon>
                      <span className="sr-only">Info icon</span>
                    </div>
                  );
              }
            })()}
            <div className="ms-3 text-sm font-normal">{toast.message}</div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
              aria-label="Close"
            >
              <span className="sr-only">Close</span>
              <CloseIcon></CloseIcon>
            </button>
          </div>
          <div className="relative bottom-[-10px]">
            {/* Grey background */}
            <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gray-700"></div>
            {/* Loading bar */}
            <div
              className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-orange-500 to-orange-300 loading-bar"
              style={
                { "--duration": toast.options.duration } as React.CSSProperties
              }
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
