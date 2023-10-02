# node-electrum-client

Electrum Protocol Client for Node.js

## what is this

https://electrum.org/

electrum is bitcoin wallet service.  
This is a library of Node.js that can communicate with the electrum(x) server.  

## install

```
npm i electrum-client
```

## spec

* http://docs.electrum.org/en/latest/protocol.html
* TCP / TLS
* JSON-RPC
* Subscribe Message
* High Performance Message
* no dependency for other library

## usage

```
const ElectrumCli = require('electrum-client')
const main = async () => {
    const ecl = new ElectrumCli(995, 'btc.smsys.me', 'tls') // tcp or tls
    await ecl.connect() // connect(promise)
    ecl.subscribe.on('blockchain.headers.subscribe', (v) => console.log(v)) // subscribe message(EventEmitter)
    try{
        const ver = await ecl.server_version("2.7.11", "1.0") // json-rpc(promise)
        console.log(ver)
    }catch(e){
        console.log(e)
    }
    await ecl.close() // disconnect(promise)
}
main()
```


