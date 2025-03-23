import React, { useState } from "react";

type RewardType = "All" | "Themes" | "Plugins" | "Models" | "Prompts";

interface Reward {
  id: string;
  type: Exclude<RewardType, "All">;
  name: string;
  description: string;
  imageUrl: string;
  tokenCost: number;
}

const SAMPLE_REWARDS: Reward[] = [
  {
    id: "1",
    type: "Themes",
    name: "Dark Forest Theme",
    description: "A soothing dark theme with forest green accents",
    imageUrl: "/public/theme-forest.png",
    tokenCost: 500
  },
  {
    id: "2",
    type: "Plugins",
    name: "Code Analyzer",
    description: "Advanced code analysis and suggestions",
    imageUrl: "/public/plugin-code.png",
    tokenCost: 1000
  },
  {
    id: "3",
    type: "Models",
    name: "Code Specialist",
    description: "A model fine-tuned for programming tasks",
    imageUrl: "/public/model-code.png",
    tokenCost: 2000
  },
  {
    id: "4",
    type: "Prompts",
    name: "Technical Writing Pack",
    description: "Collection of prompts for technical documentation",
    imageUrl: "/public/prompts-tech.png",
    tokenCost: 300
  },
  {
    id: "5",
    type: "Themes",
    name: "Ocean Breeze Theme",
    description: "Light theme with calming blue tones",
    imageUrl: "/public/theme-ocean.png",
    tokenCost: 500
  },
  {
    id: "6",
    type: "Plugins",
    name: "Image Generator",
    description: "Create images from text descriptions",
    imageUrl: "/public/plugin-image.png",
    tokenCost: 1500
  }
];

const FILTER_TYPES: RewardType[] = ["All", "Themes", "Plugins", "Models", "Prompts"];

export default function Marketplace() {
  const [selectedFilter, setSelectedFilter] = useState<RewardType>("All");

  const filteredRewards = SAMPLE_REWARDS.filter(
    reward => selectedFilter === "All" || reward.type === selectedFilter
  );

  return (
    <div>HELO WORLD</div>
    // <div className="mt-12 mx-auto max-w-7xl px-4">
    //   {/* Filters */}
    //   <div className="flex gap-2 mb-8 flex-wrap">
    //     {FILTER_TYPES.map((type) => (
    //       <button
    //         key={type}
    //         onClick={() => setSelectedFilter(type)}
    //         className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
    //           ${selectedFilter === type 
    //             ? "bg-green-600 text-white" 
    //             : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
    //       >
    //         {type}
    //       </button>
    //     ))}
    //   </div>

    //   {/* Rewards Grid */}
    //   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    //     {filteredRewards.map((reward) => (
    //       <div 
    //         key={reward.id}
    //         className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    //       >
    //         <div className="aspect-video w-full bg-gray-50">
    //           <img
    //             src={reward.imageUrl}
    //             alt={reward.name}
    //             className="w-full h-full object-cover"
    //             onError={(e) => {
    //               (e.target as HTMLImageElement).src = "/public/placeholder.png";
    //             }}
    //           />
    //         </div>
    //         <div className="p-4">
    //           <div className="flex justify-between items-start mb-2">
    //             <h3 className="text-lg font-medium text-gray-900">{reward.name}</h3>
    //             <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
    //               {reward.tokenCost.toLocaleString()} tokens
    //             </span>
    //           </div>
    //           <p className="text-gray-600 text-sm">{reward.description}</p>
    //           <button 
    //             className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
    //           >
    //             Purchase
    //           </button>
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // </div>
  );
}
