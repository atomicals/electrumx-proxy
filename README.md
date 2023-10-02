# ElectrumX HTTP Proxy
> Proxy HTTP to ElectrumX TCP connection
> Alpha

Sample Request from browser to the proxy:


```
// Fetch a transaction in verbose mode:
http://myserverhost.com/proxy/blockchain.transaction.get?params=[%229760d0a2313d9bcf951d6a1da5dddd33114325c2303cc759e6c197b8ec77fd26%22,%201]
```

## Setup

Edit `.env` with your electrumx tcp connection (only tcp supported)

```
npm install
```

## Lint

```
npm run lint
```

## Test

```
npm run test
```

## Development

```
npm run dev
```
