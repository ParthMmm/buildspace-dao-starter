import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0x98Aaf21aEE124CBff65e8fFc84a1d474CdDdB9Aa"
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Slice of Pizza ",
        description: "This NFT will give you access to pizzaDAO!",
        image: readFileSync("scripts/assets/slice.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();
