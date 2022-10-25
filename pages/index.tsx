import request from 'graphql-request'
import Head from 'next/head'
import { useMemo } from 'react'
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import ERC721DropContractProvider from 'providers/ERC721DropProvider'
import DropMetadataContractProvider, {
  useDropMetadataContract,
} from 'providers/DropMetadataProvider'
import { Stack, Paragraph } from '@zoralabs/zord'
import { GetServerSideProps, NextPage } from 'next'
import { SubgraphERC721Drop } from 'models/subgraph'
import { GET_COLLECTIONS_QUERY, SUBGRAPH_URL } from 'constants/queries'
import { ipfsImage, shortenAddress } from '@lib/helpers'
import { collectionAddresses } from '@lib/constants'
import { useAccount, useEnsName } from 'wagmi'
import { Collection } from '@components/Collection'

interface HomePageProps {
  collections: SubgraphERC721Drop[]
}

const backgroundParticlesConfig = {
  fullScreen: { enable: false },
  fpsLimit: 60,
  interactivity: {
      events: {
          onClick: {
              enable: false,
          },
          onHover: {
              enable: true,
              mode: "grab",
              parallax: {
                  enable: true,
                  force: 40,
                  smooth: 10
              },

          },
          resize: true
      },
      modes: {
          bubble: {
              distance: 400,
              duration: 2,
              opacity: 0.4,
              size: 8,
          },
          push: {
              quantity: 4,
          },
          repulse: {
              distance: 200,
              duration: 0.4,
          },
      },
  },
  particles: {
      color: {
          value: "#ffffff",
      },
      links: {
          color: "transparent",
      },
      move: {
          direction: "none",
          enable: true,
          outMode: "bounce",
          random: false,
          speed: 0.5,
          straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 400,
        },
        value: 80,
      },
      opacity: {
          random: true,
      },
      shape: {
          type: "circle",
      },
      size: {
          random: true,
          value: 1,
      },
  },
  detectRetina: true,
};

const HomePage: NextPage<HomePageProps> = ({ collections }) => {
  const { metadata } = useDropMetadataContract()
  const ogImage = ipfsImage(metadata?.image || collections[0]?.editionMetadata?.imageURI)
  const { address } = useAccount()
  const { data: ensName } = useEnsName({
    address: address,
  })
  const username = useMemo(() => ensName || shortenAddress(address), [address, ensName])

  if (!collections.length) {
    return (
      <Paragraph py="x5" align="center">
        404, contract not found.
      </Paragraph>
    )
  }

  const particlesInit = async (main) => {
    // you can initialize the tsParticles instance (main) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(main);
  };

  return (
    <>
      <Head>
        {/* <title>{collections[0].name}</title> */}
        <title>Rainbow ✕ Zora</title>
        <meta name="title" content={`${collections[0].name}`} />
        <meta
          name="description"
          content={
            collections[0].editionMetadata?.description ||
            "ZORA's creator toolkit makes it easy to create an NFT collection, with tooling that scales with your creative ambitions"
          }
        />
        <meta name="og:title" content={`${collections[0].name}`} />
        <meta
          name="og:url"
          content={`https://create.zora.co/editions/${collections[0].address}`}
        />
        <meta
          name="og:description"
          content={
            collections[0].editionMetadata?.description ||
            "ZORA's creator toolkit makes it easy to create an NFT collection, with tooling that scales with your creative ambitions"
          }
        />
        <meta name="og:image" content={ogImage} />
        <meta name="theme-color" content="#000000" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${collections[0].name}`} />
        <meta
          name="twitter:url"
          content={`https://create.zora.co/editions/${collections[0].address}`}
        />
        <meta name="twitter:image" content={ogImage} />
      </Head>
      <Particles
        init={particlesInit}
        // @ts-ignore
        options={backgroundParticlesConfig}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          padding: 0,
          margin: 0,
        }}
        
      />
      {/*<Flex justify="flex-end" p="x4" className={header}>
        <ConnectWallet />
      </Flex>*/}
      <Stack align="center" minH="100vh" style={{ zIndex: 10 }}>
        {collections.map((collection) => (
          <ERC721DropContractProvider
            key={collection.address + '_' + username}
            erc721DropAddress={collection.address}
          >
            <DropMetadataContractProvider
              metadataRendererAddress={collection.contractConfig?.metadataRenderer}
              address={collection.address}
            >
              <Collection username={username} collection={collection} />
            </DropMetadataContractProvider>
          </ERC721DropContractProvider>
        ))}
      </Stack>
    </>
  )
}

export default HomePage

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const { erc721Drops } = await request(SUBGRAPH_URL, GET_COLLECTIONS_QUERY, {
    collectionAddresses: collectionAddresses,
  })

  if (!erc721Drops.length) {
    res.statusCode = 404
  }

  return {
    props: {
      collections: erc721Drops,
    },
  }
}
