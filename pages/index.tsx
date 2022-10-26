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
  fullScreen: { enable: true },
  fpsLimit: 120,
  interactivity: {
    events: {
      onClick: {
        enable: false,
        mode: 'trail',
      },
      onHover: {
        enable: true,
        mode: "bubble",
        parallax: {
          enable: true,
          force: 10,
          smooth: 1
        },
      },
      resize: true
    },
    modes: {
      bubble: {
        distance: 50,
        duration: 0.4,
        size: 2
      },
      connect: {
        distance: 50,
        radius: 100,
      },
      grab: {
        distance: 100
      },
      push: {
        quantity: 4
      },
      remove: {
        quantity: 4
      },
      repulse: {
        distance: 50,
        duration: 2
      },
      trail: {
        delay: 0.1,
        quantity: 10
      }
    },
  },
  particles: {
    collisions: {
      enable: false,
    },
    color: {
      value: "#ffffff",
    },
    links: {
      color: "transparent",
    },
    move: {
      attract: {
        distance: 100,
        enable: false,
      },
      direction: "none",
      enable: true,
      gravity: {
        acceleration: 1,
        enable: false,
        maxSpeed: 1,
      },
      outModes: {
        default: "out",
        bottom: "out",
        left: "out",
        right: "out",
        top: "out",
      },
      random: true,
      speed: 0.5,
      spin: {
        acceleration: 1,
        enable: false,
      },
      straight: false,
      trail: {
        enable: false,
      },
      vibrate: false,
    },
    number: {
      density: {
        enable: true,
        area: 1000,
      },
      value: 500,
    },
    opacity: {
      random: {
        enable: true
      },
      value: {
        min: 0,
        max: 1,
      },
    },
    shape: {
      type: "circle",
    },
    size: {
      random: {
        enable: true
      },
      value: {
        min: 0.5,
        max: 1
      },
    },
  },
  detectRetina: true,
};

const HomePage: NextPage<HomePageProps> = ({ collections }) => {
  const { metadata } = useDropMetadataContract()
  {/* const ogImage = ipfsImage(metadata?.image || collections[0]?.editionMetadata?.imageURI) */}
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
        <meta name="title" content="Rainbow ✕ Zora" />
        {/* <meta name="title" content={`${collections[0].name}`} />
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
        <meta name="og:image" content={ogImage} /> */}
        <meta name="theme-color" content="#000000" />
        {/* <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${collections[0].name}`} />
        <meta
          name="twitter:url"
          content={`https://create.zora.co/editions/${collections[0].address}`}
        />
        <meta name="twitter:image" content={ogImage} /> */}
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
          zIndex: -10,
        }}
      />
      <div
        style={{
          boxShadow: 'rgb(0, 0, 0) 0px 0px 50px 20px inset',
          position: 'fixed',
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
