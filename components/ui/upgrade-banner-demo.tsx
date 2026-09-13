import * as React from "react";
import { UpgradeBanner } from "@/components/ui/upgrade-banner";

function UpgradeBannerDemo() {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Show Banner
      </button>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <UpgradeBanner
        buttonText="Upgrade to Pro"
        description="for 2x more CPUs and faster builds"
        onClose={() => setIsVisible(false)}
        onClick={() => console.log("Upgrade clicked")}
      />
    </div>
  );
}

export { UpgradeBannerDemo };
