const main = async () => {
    // const [owner, randomPerson] = await hre.ethers.getSigners();
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    const waveContract = await waveContractFactory.deploy(
        {
            value: hre.ethers.utils.parseEther("0.1"),
        }
    );

    await waveContract.deployed();
    console.log("Contract address:", waveContract.address);

    // Get contract balance
    let contractBalance = await hre.ethers.provider.getBalance(
        waveContract.address
    );
    console.log("Contract balance:", hre.ethers.utils.formatEther(contractBalance));

    // let waveCount;
    // waveCount = await waveContract.getTotalWaves();
    // console.log(waveCount.toNumber());


    // wave
    let waveTxn = await waveContract.wave("A message!");
    await waveTxn.wait(); //Wait for the transaction to be mined

    let waveTxn2 = await waveContract.wave("This is message 2!");
    await waveTxn2.wait(); //Wait for the transaction to be mined

    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(contractBalance));

    // const [_, randomPerson] = await hre.ethers.getSigners();
    // waveTxn = await waveContract.connect(randomPerson).wave("Another message");
    // await waveTxn.wait(); //wait for transaction to be mined

    let allWaves = await waveContract.getAllWaves();
    console.log(allWaves);

};

const runMain = async () => {
    try {
        await main();
        process.exit(0); // exit Node process without error
    } catch (error) {
        console.log(error);
        process.exit(1); // exit Node process while indicating 'Uncaught Fatal Exception' error
    }

};

runMain();