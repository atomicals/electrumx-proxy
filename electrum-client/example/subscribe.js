const ElectrumClient = require('..')
const sleep = (ms) => new Promise((resolve,_) => setTimeout(() => resolve(), ms))

const main = async () => {
    try{
        const ecl = new ElectrumClient(50002, 'bitcoins.sk', 'tls')
        ecl.subscribe.on('server.peers.subscribe', console.log)
        ecl.subscribe.on('blockchain.numblocks.subscribe', console.log)
        ecl.subscribe.on('blockchain.headers.subscribe', console.log)
        ecl.subscribe.on('blockchain.address.subscribe', console.log)
        ecl.subscribe.on('blockchain.scripthash.subscribe', console.log)
        await ecl.connect()
        await ecl.server_version("3.0.5", "1.1")
        const p1 = await ecl.serverPeers_subscribe()
        const p2 = await ecl.blockchainHeaders_subscribe()
        // Note: blockchain.numblocks.subscribe is deprecated in protocol version 1.1
        const p3 = await ecl.blockchainAddress_subscribe('1BK45iaPrrd26gKagrXytvz6anrj3hQ2pQ')
        // Subscribe to corresponding scripthash for the above address
        const p4 = await ecl.blockchainScripthash_subscribe('f3aa57a41424146327e5c88c25db8953dd16c6ab6273cdb74a4404ed4d0f5714')
        while(true){
            await sleep(1000)
            const ver = await ecl.server_version("3.0.5", "1.1")
        }
        await ecl.close()
    }catch(e){
        console.log("error")
        console.log(e)
    }
}
main()
