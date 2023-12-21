const hre = require("hardhat");
const ethers = hre.ethers;

let DirectListings;
let directListings;

let Offers;
let offers;

let EnglishAuctions;
let englishAuctions;

let PluginMap;
let pluginMap;

let Marketplace;
let marketplace;

let owner;
let addrs;

let gasCost;

const DISCOUNT_CURRENCY = {
  [5]: "0xac8CEe84dBec5b10A5FA15EdC1C1b0fb1368168E",
	[56]: "0x988F7c894e4001EEB7B570CDE80dffE21CF7B6B9",
  [97]: "0xf9D72bbc2399Ff99A0165abBFf15a331349Ee9e2",
  [80001]: "0x34227aeC641fBAdD4d4F32CD387b45a583622589",
};

const DISCOUNT_BPS = {
	[56]: 50
}

/* WETH addresses */
const WETH_ADDRESS = {
  [1]: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  [137]: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
  [80001]: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
  [5]: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
  [10]: "0x4200000000000000",
  [42161]: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
  [421611]: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  [56]: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  [97]: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
  [8453]: "0x4200000000000000000000000000000000000006",
  [84531]: "0x4200000000000000000000000000000000000006",
}

/* Royalty engine addresses */
const ROYALTY_ENGINE = {
  [1]: "0x0385603ab55642cb4dd5de3ae9e306809991804f",
  [137]: "0x28EdFcF0Be7E86b07493466e7631a213bDe8eEF2",
  [80001]: "0x0a01E11887f727D1b1Cd81251eeEE9BEE4262D07",
  [5]: "0xEF770dFb6D5620977213f55f99bfd781D04BBE15",
  [10]: "0xEF770dFb6D5620977213f55f99bfd781D04BBE15",
  [56]: "0xEF770dFb6D5620977213f55f99bfd781D04BBE15",
  [42161]: "0xEF770dFb6D5620977213f55f99bfd781D04BBE15",
  [421611]: "0xEF770dFb6D5620977213f55f99bfd781D04BBE15",
  [97]: ethers.ZeroAddress,
  [8453]: ethers.ZeroAddress,
  [84531]: ethers.ZeroAddress,
}

async function verify (address, args, options) {
    try {
        // verify the token contract code
        await hre.run("verify:verify", {
            address: address,
            constructorArguments: args,
            ...options
        });
    } catch (e) {
        console.log("error verifying contract", e);
    }
}

async function main () {
    // addresses
    [owner, ...addrs] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", owner.address);
    console.log("Account balance:", (await owner.provider.getBalance(owner.address)).toString());

    const contractsToVerify = [];

    // // Direct Listings
    DirectListings = await ethers.getContractFactory("contracts/direct-listings/DirectListingsLogic.sol:DirectListingsLogic");

    // // Deploy Direct Listings
    const directListingsArgs = [WETH_ADDRESS[hre.network.config.chainId]];
    console.log({
      network: hre.network
    })
    console.log('chain id is ', hre.network.config.chainId)
    console.log('weth is', WETH_ADDRESS[hre.network.config.chainId])
		gasCost = await owner.provider.estimateGas(DirectListings.deploy(...directListingsArgs));
		console.log('gas cost for direct listings is', gasCost.toString())
    directListings = await DirectListings.deploy(...directListingsArgs);
    await directListings.waitForDeployment();
    console.log("direct listings deployed to:", await directListings.getAddress());
    contractsToVerify.push({ name: "Direct Listings", address: await directListings.getAddress(), args: directListingsArgs });

    // // deploy Offers
    Offers = await ethers.getContractFactory("contracts/offers/OffersLogic.sol:OffersLogic");
    const offersArgs = [];
		gasCost = await owner.provider.estimateGas(Offers.deploy(...offersArgs));
		console.log('gas cost for offers is', gasCost.toString())
    offers = await Offers.deploy(...offersArgs);
    await offers.waitForDeployment();
    console.log("offers deployed to:", await offers.getAddress());
    contractsToVerify.push({ name: "Offers", address: await offers.getAddress(), args: offersArgs });

    // // deploy English Auctions
    EnglishAuctions = await ethers.getContractFactory("contracts/english-auctions/EnglishAuctionsLogic.sol:EnglishAuctionsLogic");
    const englishAuctionsArgs = [WETH_ADDRESS[hre.network.config.chainId]];
		gasCost = await owner.provider.estimateGas(EnglishAuctions.deploy(...englishAuctionsArgs));
		console.log('gas cost for english auctions is', gasCost.toString())
    englishAuctions = await EnglishAuctions.deploy(...englishAuctionsArgs);
    await englishAuctions.waitForDeployment();
    console.log("english auctions deployed to:", await englishAuctions.getAddress());
    contractsToVerify.push({ name: "English Auctions", address: await englishAuctions.getAddress(), args: englishAuctionsArgs });

    // Extensions
    const directListingsExtension = [
      [
        "DirectListingsLogic",
        "",
        await directListings.getAddress(),
      ],
      [
        ["0x48dd77df","approveBuyerForListing(uint256,address,bool)"],
        ["0xea8f9a3c","approveCurrencyForListing(uint256,address,uint256)"],
        ["0x704232dc","buyFromListing(uint256,address,uint256,address,uint256)"],
        ["0x305a67a8","cancelListing(uint256)"],
        ["0x746415b5","createListing((address,uint256,uint256,address,uint256,uint128,uint128,bool))"],
        ["0xfb14079d","currencyPriceForListing(uint256,address)"],
        ["0xc5275fb0","getAllListings(uint256,uint256)"],
        ["0x31654b4d","getAllValidListings(uint256,uint256)"],
        ["0x107a274a","getListing(uint256)"],
        ["0x9cfbe2a6","isBuyerApprovedForListing(uint256,address)"],
        ["0xa8519047","isCurrencyApprovedForListing(uint256,address)"],
        ["0xc78b616c","totalListings()"],
        ["0x07b67758","updateListing(uint256,(address,uint256,uint256,address,uint256,uint128,uint128,bool))"],
      ]
    ];
    const offersExtension = [
      [
        "OffersLogic",
        "",
        await offers.getAddress(),
      ],
      [
        ["0xc815729d","acceptOffer(uint256)"],
        ["0xef706adf","cancelOffer(uint256)"],
        ["0xc1edcfbe","getAllOffers(uint256,uint256)"],
        ["0x91940b3e","getAllValidOffers(uint256,uint256)"],
        ["0x4579268a","getOffer(uint256)"],
        ["0x016767fa","makeOffer((address,uint256,uint256,address,uint256,uint256))"],
        ["0xa9fd8ed1","totalOffers()"],
      ]
    ];
    const englishAuctionsExtension = [
      [
        "EnglishAuctionsLogic",
        "",
        await englishAuctions.getAddress(),
      ],
      [
        ["0x0858e5ad","bidInAuction(uint256,uint256)"],
        ["0x96b5a755","cancelAuction(uint256)"],
        ["0xebf05a62","collectAuctionPayout(uint256)"],
        ["0x03a54fe0","collectAuctionTokens(uint256)"],
        ["0x16654d40","createAuction((address,uint256,uint256,address,uint256,uint256,uint64,uint64,uint64,uint64))"],
        ["0xc291537c","getAllAuctions(uint256,uint256)"],
        ["0x7b063801","getAllValidAuctions(uint256,uint256)"],
        ["0x78bd7935","getAuction(uint256)"],
        ["0x6891939d","getWinningBid(uint256)"],
        ["0x1389b117","isAuctionExpired(uint256)"],
        ["0x2eb566bd","isNewWinningBid(uint256,uint256)"],
        ["0x16002f4a","totalAuctions()"],
      ]
    ];
    const extensions = [
      directListingsExtension,
      offersExtension,
      englishAuctionsExtension
    ];

    // deploy Marketplace
    Marketplace = await ethers.getContractFactory("contracts/Marketplace.sol:MarketplaceV3");
    // const marketplaceArgs = [pluginMap.address, ROYALTY_ENGINE[hre.network.config.chainId]];
    console.log(JSON.stringify([extensions, ROYALTY_ENGINE[hre.network.config.chainId], WETH_ADDRESS[hre.network.config.chainId]]))
    const marketplaceArgs = [[extensions, ROYALTY_ENGINE[hre.network.config.chainId], WETH_ADDRESS[hre.network.config.chainId]]];
    marketplace = await Marketplace.deploy(...marketplaceArgs);
    await marketplace.waitForDeployment();
    console.log("marketplace deployed to:", await marketplace.getAddress());
    contractsToVerify.push({ name: "Marketplace", address: await marketplace.getAddress(), args: marketplaceArgs });

    // // initialize marketplace
    const initTx = await marketplace.initialize(
      owner.address,
      "",
      [],
      owner.address,
      100,
      DISCOUNT_CURRENCY[hre.network.config.chainId] || ethers.constants.AddressZero,
			DISCOUNT_BPS[hre.network.config.chainId] || 0,
    );
    await initTx.wait();
    console.log("marketplace initialized");

    console.log("verifying marketplace...");
    await verify(await marketplace.getAddress(), marketplaceArgs);
    console.log("marketplace verified");

    console.log("verifying direct listings...");
    await verify(await directListings.getAddress(), directListingsArgs, {
      contract: "contracts/direct-listings/DirectListingsLogic.sol:DirectListingsLogic"
    });
    console.log("direct listings verified");

    console.log("verifying offers...");
    await verify(await offers.getAddress(), offersArgs);
    console.log("offers verified");

    console.log("verifying english auctions...");
    await verify(await englishAuctions.getAddress(), englishAuctionsArgs);
    console.log("english auctions verified");

    // map over the contracts to verify and console log them in a table
    console.table(contractsToVerify);
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});