require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
};

// Use the locally installed solc-js compiler. This avoids download errors on
// networks where Hardhat cannot reach binaries.soliditylang.org.
const { subtask } = require("hardhat/config");
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require("hardhat/builtin-tasks/task-names");

subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD).setAction(async (args, hre, runSuper) => {
  if (args.solcVersion === "0.8.20") {
    return {
      compilerPath: require.resolve("solc/soljson.js"),
      isSolcJs: true,
      version: "0.8.20",
      longVersion: "0.8.20+commit.a1b79de6.Emscripten.clang",
    };
  }

  return runSuper();
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};
