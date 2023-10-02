const ElectrumClient = require('..')

const main = async () => {
    const ecl = new ElectrumClient(995, 'btc.smsys.me', 'tls')
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
