import { fetchTokenMetadata } from '../src';

const coinType = '0x7262fb2f7a3a14c888c438a3cd9b912469a58cf60f367352c46584262e8299aa::ika::IKA';

async function main() {
  const metadata = await fetchTokenMetadata(coinType);
  console.log('Token Metadata:', metadata.decimals);
}

main();
