import React from "react";
import { Button } from "@/components/ui/button";
import { 
  showSuccessToast, 
  showErrorToast, 
  showWarningToast, 
  showInfoToast,
  showToast
} from "@/lib/toast-helpers";

export function ToastDemo() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row flex-wrap p-4">
      <Button
        onClick={() =>
          showSuccessToast({
            message: "Your reservation has been confirmed!",
            title: "Success"
          })
        }
        variant="default"
        className="bg-green-600 hover:bg-green-700"
      >
        Show Success Toast
      </Button>

      <Button
        onClick={() =>
          showErrorToast({
            message: "Sorry, we couldn't process your reservation. Please try again.",
            title: "Error"
          })
        }
        variant="destructive"
      >
        Show Error Toast
      </Button>

      <Button
        onClick={() =>
          showWarningToast({
            message: "Limited seats available for selected time.",
            title: "Warning"
          })
        }
        variant="default"
        className="bg-yellow-600 hover:bg-yellow-700"
      >
        Show Warning Toast
      </Button>

      <Button
        onClick={() =>
          showInfoToast({
            message: "Your reservation has been sent for approval.",
            title: "Information"
          })
        }
        variant="default"
        className="bg-blue-600 hover:bg-blue-700"
      >
        Show Info Toast
      </Button>

      <Button
        onClick={() =>
          showToast({
            type: "default",
            message: "Thank you for visiting Jemini Foods!",
          })
        }
        variant="outline"
      >
        Show Default Toast
      </Button>
    </div>
  );
}