const Client = require("../lib/electrum_cli")

const proc = async(cl) => {
    try{
        const version = await cl.server_version("2.7.11", "1.0")
        console.log(version)
        const balance = await cl.blockchainAddress_getBalance("MS43dMzRKfEs99Q931zFECfUhdvtWmbsPt")
        console.log(balance)
        const utxo = await cl.blockchainAddress_listunspent("MS43dMzRKfEs99Q931zFECfUhdvtWmbsPt")
        console.log(utxo)
    }catch(e){
        console.log(e)
    }
}

const main = async(port, host) => {
    const cl = new Client(port, host);
    await cl.connect()
    for(let i = 0; i<100; ++i){
        await proc(cl)
    }
    await cl.close()
}

main(4444, "localhost")
