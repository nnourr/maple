import React, { useState, useRef, useEffect } from "react";

type EcoCategory =
  | "All"
  | "Sustainable Living"
  | "Clean Energy"
  | "Organic Food"
  | "Eco Fashion"
  | "Zero Waste";

interface EcoProduct {
  id: string;
  category: Exclude<EcoCategory, "All">;
  store: string;
  code: string;
  description: string;
  discount: string;
  expiryDate: string;
  impact: string; // Environmental impact description
  tokenCost: number;
  productUrl: string;
}

// Category-specific colors for placeholders - using earth/nature tones
const categoryColors: Record<
  Exclude<EcoCategory, "All">,
  { bg: string; accent: string }
> = {
  "Sustainable Living": { bg: "#E8F5E9", accent: "#2E7D32" }, // Green
  "Clean Energy": { bg: "#E1F5FE", accent: "#0288D1" }, // Blue
  "Organic Food": { bg: "#F1F8E9", accent: "#558B2F" }, // Light Green
  "Eco Fashion": { bg: "#F3E5F5", accent: "#7B1FA2" }, // Purple
  "Zero Waste": { bg: "#FFF3E0", accent: "#EF6C00" }, // Orange
};

const PlaceholderSVG: React.FC<{ category: Exclude<EcoCategory, "All"> }> = ({
  category,
}) => {
  const colors = categoryColors[category];
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 400 225"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="400" height="225" fill={colors.bg} />
      <circle
        cx="200"
        cy="112.5"
        r="60"
        fill={colors.accent}
        fillOpacity="0.2"
      />
      <circle
        cx="200"
        cy="112.5"
        r="45"
        fill={colors.accent}
        fillOpacity="0.3"
      />
      <circle
        cx="200"
        cy="112.5"
        r="30"
        fill={colors.accent}
        fillOpacity="0.4"
      />
      <text
        x="200"
        y="117.5"
        fontSize="18"
        fontWeight="500"
        fill={colors.accent}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {category}
      </text>
    </svg>
  );
};

const SAMPLE_PRODUCTS: EcoProduct[] = [
  {
    id: "1",
    category: "Organic Food",
    store: "Green Earth Market",
    code: "ORGANIC30",
    description: "30% off on organic, locally-sourced produce",
    discount: "30% OFF",
    expiryDate: "2024-05-30",
    impact: "Supports local farmers & reduces carbon footprint",
    tokenCost: 50,
    productUrl: "https://greenearthmarket.com/organic-produce",
  },
  {
    id: "2",
    category: "Clean Energy",
    store: "SolarPower Plus",
    code: "SOLAR100",
    description: "$100 off home solar panel installation",
    discount: "$100 OFF",
    expiryDate: "2024-06-15",
    impact: "Reduces household carbon emissions by 80%",
    tokenCost: 100,
    productUrl: "https://solarpowerplus.com/installation",
  },
  {
    id: "3",
    category: "Eco Fashion",
    store: "Sustainable Style",
    code: "ECO40",
    description: "40% off sustainable clothing collection",
    discount: "40% OFF",
    expiryDate: "2024-05-20",
    impact: "Made from recycled materials & ethical labor",
    tokenCost: 75,
    productUrl: "https://sustainablestyle.com/collection",
  },
  {
    id: "4",
    category: "Sustainable Living",
    store: "EcoHome",
    code: "GREEN25",
    description: "25% off bamboo household items",
    discount: "25% OFF",
    expiryDate: "2024-07-01",
    impact: "Plastic-free, biodegradable alternatives",
    tokenCost: 40,
    productUrl: "https://ecohome.com/bamboo",
  },
  {
    id: "5",
    category: "Zero Waste",
    store: "Zero Co",
    code: "ZEROWASTE",
    description: "20% off reusable container starter kit",
    discount: "20% OFF",
    expiryDate: "2024-06-01",
    impact: "Eliminates single-use plastic waste",
    tokenCost: 30,
    productUrl: "https://zeroco.com/starter-kit",
  },
  {
    id: "6",
    category: "Sustainable Living",
    store: "EcoClean",
    code: "CLEAN35",
    description: "35% off natural cleaning products",
    discount: "35% OFF",
    expiryDate: "2024-05-25",
    impact: "Chemical-free & biodegradable formulas",
    tokenCost: 45,
    productUrl: "https://ecoclean.com/natural",
  },
];

const FILTER_CATEGORIES: EcoCategory[] = [
  "All",
  "Sustainable Living",
  "Clean Energy",
  "Organic Food",
  "Eco Fashion",
  "Zero Waste",
];

interface ConfirmModalProps {
  product: EcoProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userTokens: number;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
  userTokens,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  if (!product) return null;

  return (
    <dialog
      ref={dialogRef}
      className="p-6 bg-white [&::backdrop]:bg-black/30 fixed inset-0 w-full h-full mx-auto mt-4"
      onClose={onClose}
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Confirm Redemption
      </h2>

      <div className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Your balance</p>
          <p className="text-lg font-semibold text-gray-900">{userTokens} 🌿</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Cost</p>
          <p className="text-lg font-semibold text-gray-900">
            {product.tokenCost} 🌿
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Remaining balance after redemption
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {userTokens - product.tokenCost} 🌿
          </p>
        </div>
        <p className="py-2 px-4 text-sm text-gray-500">
          You are about to redeem a {product.discount} discount code for{" "}
          {product.store}
        </p>
      </div>

      <div className="flex gap-2 mt-4 px-4">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-[#0e813e] text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          Confirm Redemption
        </button>
      </div>
    </dialog>
  );
};

export default function Marketplace() {
  const [selectedFilter, setSelectedFilter] = useState<EcoCategory>("All");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [userTokens, setUserTokens] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<EcoProduct | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [redeemingProduct, setRedeemingProduct] = useState<string | null>(null);

  const filteredProducts = SAMPLE_PRODUCTS.filter(
    (product) => selectedFilter === "All" || product.category === selectedFilter
  );

  useEffect(() => {
    // Mock user token balance
    chrome.storage.local.get("tokens", (data) => {
      setUserTokens(data.tokens || 0);
    });
  }, []);

  const handleRedeemClick = (product: EcoProduct) => {
    if (userTokens >= product.tokenCost) {
      setSelectedProduct(product);
      setIsModalOpen(true);
    }
  };

  const handleConfirmRedeem = () => {
    if (selectedProduct && userTokens >= selectedProduct.tokenCost) {
      // Mock token transaction
      setUserTokens((prevTokens) => prevTokens - selectedProduct.tokenCost);

      // Copy code and set feedback states
      navigator.clipboard.writeText(selectedProduct.code);
      setCopiedCode(selectedProduct.code);
      setRedeemingProduct(selectedProduct.id);

      // Close modal
      setIsModalOpen(false);

      // Redirect after a delay
      setTimeout(() => {
        setCopiedCode(null);
        setRedeemingProduct(null);
        window.open(selectedProduct.productUrl, "_blank");
      }, 1500);
    }
  };

  return (
    <div className="bg-white rounded-4xl border border-gray-200 overflow-hidden pb-4 mt-8">
      <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-white ">
        <h2 className="text-xl font-bold text-gray-900">
          Eco-Friendly Marketplace
        </h2>
        <div className="bg-green-50 px-4 py-2 rounded-full border border-green-100">
          <span className="text-sm font-medium text-green-800 text-nowrap">
            Balance: {userTokens} 🌿
          </span>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 md:py-8">
        {/* Category Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-700">
              {selectedFilter === "All" ? "All Products" : selectedFilter}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              {filteredProducts.length} available
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTER_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedFilter(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${
                  selectedFilter === category
                    ? "bg-[#0e813e] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video w-full">
                <PlaceholderSVG category={product.category} />
              </div>
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {product.store}
                  </h3>
                  <span className="text-lg font-semibold text-gray-900">
                    {product.discount}
                  </span>
                </div>
                <p className="text-base text-gray-600 mb-2">
                  {product.description}
                </p>
                <p className="text-sm text-green-600 mb-3">
                  🌱 {product.impact}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-medium flex items-center gap-1">
                    {product.tokenCost}{" "}
                    <span className="text-green-600">🌿</span>
                  </span>
                  <button
                    onClick={() => handleRedeemClick(product)}
                    disabled={
                      userTokens < product.tokenCost ||
                      redeemingProduct === product.id
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        userTokens >= product.tokenCost &&
                        redeemingProduct !== product.id
                          ? "bg-[#0e813e] text-white hover:bg-green-700"
                          : redeemingProduct === product.id
                          ? "bg-blue-500 text-white cursor-wait"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    {redeemingProduct === product.id
                      ? "Copied! Opening store..."
                      : copiedCode === product.code
                      ? "Copied!"
                      : userTokens >= product.tokenCost
                      ? "Redeem"
                      : "Insufficient Tokens"}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Expires: {new Date(product.expiryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmRedeem}
        userTokens={userTokens}
      />
    </div>
  );
}
