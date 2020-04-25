const homedir = require('os').homedir
const path = require('path')

const HDWalletProvider = require('@truffle/hdwallet-provider')

const DEFAULT_MNEMONIC =
    ''

var mnemonicStr = "";

const defaultRPC = network => `https://${network}.eth.aragon.network`

const configFilePath = filename => path.join(homedir(), `.aragon/${filename}`)

const mnemonic = () => {
    try {
        return require(configFilePath('mnemonic.json')).mnemonic
    } catch (e) {
        return DEFAULT_MNEMONIC
    }
}

const settingsForNetwork = network => {
    try {
        return require(configFilePath(`${network}_key.json`))
    } catch (e) {
        return {}
    }
}

// Lazily loaded provider
const providerForNetwork = network => () => {
    let { rpc, keys } = settingsForNetwork(network)
    rpc = rpc || defaultRPC(network)

    if (!keys || keys.length === 0) {
        return new HDWalletProvider(mnemonic(), rpc)
    }

    return new HDWalletProvider(keys, rpc)
}

const mochaGasSettings = {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
        currency: 'USD',
        gasPrice: 3,
    },
}

const mocha = process.env.GAS_REPORTER ? mochaGasSettings : {}

module.exports = {
    networks: {
        rpc: {
            network_id: 15,
            host: 'localhost',
            port: 8545,
            gas: 6.9e6,
            gasPrice: 15000000001,
        },
        localhost: {
            host: "localhost",     // Localhost (default: none)
            port: 22000,            // Standard Ethereum port (default: none)
            network_id: "10",       // Any network (default: none)
            gas: 4712387,
            gasPrice: 10000000,  // 20 gwei (in wei) (default: 1 gwei)
            from: "0xecf7e57d01d3d155e5fc33dbc7a58355685ba39c"        // Account to send txs from (default: accounts[0])
        },
        smilotestnet: {
            provider: () =>
                new HDWalletProvider(mnemonicStr, "https://testnet.smilo.foundation/api", 0, 5, "m/44'/20080914'/0'/0/"),
            port: 443,
            network_id: "10", // Match network id
            gas: 4712387,
            gasPrice: 10000000, // 0,01 gwei
            from: "0xecf7e57d01d3d155e5fc33dbc7a58355685ba39c"        // Account to send txs from (default: accounts[0])

        },
        smilo: {
            provider: () =>
                new HDWalletProvider(mnemonicStr, "https://api.smilo.foundation", 0, 5, "m/44'/20080914'/0'/0/"),
            port: 443,
            network_id: "20080914", // Match network id
            gas: 4712387,
            gasPrice: 10000000, // 0,01 gwei

        },
        mainnet: {
            network_id: 1,
            provider: providerForNetwork('mainnet'),
            gas: 7.9e6,
        },
        ropsten: {
            network_id: 3,
            provider: providerForNetwork('ropsten'),
            gas: 7.9e6,
        },
        rinkeby: {
            network_id: 4,
            provider: providerForNetwork('rinkeby'),
            gas: 6.9e6,
            gasPrice: 15000000001,
        },
        kovan: {
            network_id: 42,
            provider: providerForNetwork('kovan'),
            gas: 6.9e6,
        },
        coverage: {
            host: 'localhost',
            network_id: '*',
            port: 8555,
            gas: 0xffffffffff,
            gasPrice: 0x01,
        },
    },
    build: {},
    mocha,
    solc: {
        optimizer: {
            // See the solidity docs for advice about optimization and evmVersion
            // https://solidity.readthedocs.io/en/v0.5.12/using-the-compiler.html#setting-the-evm-version-to-target
            enabled: true,
            runs: 10000,   // Optimize for how many times you intend to run the code
        },
    },
}

//npx truffle exec --network localhost scripts/deploy-apm.js