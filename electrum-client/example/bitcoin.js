const ElectrumClient = require('..')

const peers = require('electrum-host-parse').getDefaultPeers("BitcoinSegwit").filter(v => v.ssl)
const getRandomPeer = () => peers[peers.length * Math.random() | 0]

const main = async () => {
    const peer = getRandomPeer()
    console.log('begin connection: ' + JSON.stringify(peer))
    const ecl = new ElectrumClient(peer.ssl, peer.host, 'ssl')
    await ecl.connect()
    try{
        const ver = await ecl.server_version("2.7.11", "1.0")
        console.log(ver)
        const balance = await ecl.blockchainAddress_getBalance("12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX")
        console.log(balance)
        const unspent = await ecl.blockchainAddress_listunspent("12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX")
        console.log(unspent)
    }catch(e){
        console.log(e)
    }
    await ecl.close()
}
main().catch(console.log)
