import { motion, AnimatePresence } from 'framer-motion'
import { SubgraphERC721Drop } from 'models/subgraph'
import ReactMarkdown from 'react-markdown'
import { useDropMetadataContract } from 'providers/DropMetadataProvider'
import { useState } from 'react'
import { useSaleStatus } from 'hooks/useSaleStatus'
import { useDisconnect } from 'wagmi'
import { ipfsImage } from '@lib/helpers'
import { maxWidth, heroImage, wrapWords } from 'styles/styles.css'
import { MintComponent } from '@components/zord/MintComponent'
import { MintDetails } from '@components/zord/MintDetails'
import { PresaleComponent } from '@components/zord/PresaleComponent'
import {
  vars,
  Box,
  Flex,
  Well,
  Stack,
  Text,
  Button,
  Paragraph,
  SpinnerOG,
} from '@zoralabs/zord'

export function Collection({
  collection,
  username,
}: {
  collection: SubgraphERC721Drop
  username?: string
}) {
  const { metadata } = useDropMetadataContract()
  const { disconnect } = useDisconnect()
  const { presaleExists, saleNotStarted, saleIsFinished } = useSaleStatus({ collection })
  const [showPresale, setShowPresale] = useState(saleNotStarted && !saleIsFinished)

  return (
    <Flex
      mt="x3"
      align="center"
      direction={{ '@initial': 'column', '@768': 'row-reverse' }}
      gap="x3"
      p={{ '@initial': 'x1', '@576': 'x10' }}
      w="100%"
      style={{ maxWidth: 1360, margin: 'auto', minHeight: '80vh', zIndex: 10 }}
    >
        <Flex flex={{ '@initial': '1', '@1024': '1' }} p="x2" justify="center">
          <motion.div
            animate={{
              scale: 1,
              y: 0,
            }}
            initial={{
              scale: 0,
              y: 200,
            }}
            transition={{
              damping: 40,
              delay: 0.4,
              mass: 1,
              stiffness: 300,
              type: 'spring',
            }}
          >
            <motion.div
              animate={{
                rotateY: 0,
                transformPerspective: 1200,
              }}
              initial={{
                rotateY: 180,
                transformPerspective: 0,
              }}
              transition={{
                damping: 8,
                delay: 0.4,
                mass: 1,
                stiffness: 60,
                type: 'spring',
              }}
            >
              <img
                className={heroImage}
                src="appicon.png"
                alt={collection.name}
              />
            </motion.div>
          </motion.div>
        </Flex>
      <Box flex={{ '@initial': '1', '@1024': 'none' }} className={maxWidth} p="x4">
        <Stack gap="x2" mb="x3">
          <Text variant="display-md" mb="x2">
            {/* {collection.name} */}
            Rainbow ✕ Zora
          </Text>
          <Paragraph className={wrapWords} mb="x2">
            <ReactMarkdown>
              {/* {JSON.parse(`"${metadata?.description || collection?.editionMetadata?.description}"`)} */}
              A special edition Rainbow app icon brought to you by Rainbow and Zora. Mint the NFT to your Rainbow wallet to unlock the icon.
            </ReactMarkdown>
          </Paragraph>
        </Stack>

        <Box>
          {collection != null ? (
            <>
              {presaleExists ? (
                <>
                  <Flex flexChildren gap="x3" mb="x4">
                    <Button
                      pill
                      variant={showPresale ? 'primary' : 'ghost'}
                      color={showPresale ? 'primary' : 'tertiary'}
                      onClick={() => setShowPresale(true)}
                    >
                      Presale
                    </Button>
                    <Button
                      pill
                      variant={!showPresale ? 'primary' : 'ghost'}
                      color={!showPresale ? 'primary' : 'tertiary'}
                      onClick={() => setShowPresale(false)}
                    >
                      Public sale
                    </Button>
                  </Flex>
                  <Box style={{ display: showPresale ? 'block' : 'none' }}>
                    <PresaleComponent collection={collection} />
                  </Box>
                  <Box style={{ display: !showPresale ? 'block' : 'none' }}>
                    <MintComponent collection={collection} />
                  </Box>
                </>
              ) : (
                <MintComponent collection={collection} />
              )}

              <Box>
                {username && (
                  <Well borderColor="accent" py="x1" mt="x4">
                    <Flex justify="space-between" align="center">
                      <Text fontSize={14}>Logged in as {username}</Text>
                      <Button pill variant="ghost" onClick={disconnect} positive="relative" style={{ left: vars.space.x5 }}>
                        <Box as="span" fontSize={14}>
                          Disconnect
                        </Box>
                      </Button>
                    </Flex>
                  </Well>
                )}
              </Box>
              <Well borderColor="accent" fontSize={14} mt="x4">
                <MintDetails collection={collection} showToggle={false} />
              </Well>
            </>
          ) : (
            <Paragraph align="center" mt="x8">
              <SpinnerOG />
            </Paragraph>
          )}
        </Box>
      </Box>
    </Flex>
  )
}
