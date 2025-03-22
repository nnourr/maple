import React from "react";

interface TokenCounterProps {
  inputTokens: number;
  outputTokens: number;
  onReset: () => void;
}

const TokenCounter: React.FC<TokenCounterProps> = ({
  inputTokens,
  outputTokens,
  onReset,
}) => {
  console.log("[TokenCounter] Rendering with props", {
    inputTokens,
    outputTokens,
  });
  const totalTokens = inputTokens + outputTokens;
  console.log("[TokenCounter] Calculated totalTokens:", totalTokens);

  return (
    <div className="token-counter">
      <h2 className="text-base font-medium mb-2">Token Usage</h2>

      <div className="bg-white rounded p-3 shadow-sm mb-4">
        <div className="flex justify-between py-1">
          <span>Input Tokens:</span>
          <span className="font-medium">{inputTokens.toLocaleString()}</span>
        </div>

        <div className="flex justify-between py-1">
          <span>Output Tokens:</span>
          <span className="font-medium">{outputTokens.toLocaleString()}</span>
        </div>

        <div className="flex justify-between py-1 mt-1 pt-1 border-t border-gray-200 font-bold">
          <span>Total Tokens:</span>
          <span>{totalTokens.toLocaleString()}</span>
        </div>
      </div>

      <button
        className="w-full py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600"
        onClick={() => {
          console.log("[TokenCounter] Reset button clicked");
          onReset();
        }}
      >
        Reset Counters
      </button>

      <div className="mt-4 text-center text-gray-500 text-xs">
        <small>
          Approximate cost: $
          {(
            (inputTokens / 1000) * 0.0015 +
            (outputTokens / 1000) * 0.002
          ).toFixed(4)}
          <br />
          (Based on GPT-4 pricing)
        </small>
      </div>
    </div>
  );
};

export default TokenCounter;
