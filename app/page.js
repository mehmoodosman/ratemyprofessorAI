'use client'
import { Box, Button, Stack, TextField, Typography, useTheme, useMediaQuery } from '@mui/material'
import { useState } from 'react'
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ReactMarkdown from 'react-markdown'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const sendMessage = async () => {
    setMessage('')
    setMessages((messages) => [
      ...messages,
      {role: 'user', content: message},
      {role: 'assistant', content: ''},
    ])
  
    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, {role: 'user', content: message}]),
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let result = ''
  
      return reader.read().then(function processText({done, value}) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), {stream: true})
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            {...lastMessage, content: lastMessage.content + text},
          ]
        })
        return reader.read().then(processText)
      })
    })
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
  <Box
    width="100vw"
    height="100vh"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    bgcolor="#06091B"
    p={2}
  >
    <Stack
      direction="column"
      width={isMobile ? '100%' : '95%'}
      height={isMobile ? '100%' : '95%'}
      border="1px solid black"
      borderRadius={2}
      boxShadow={3}
      p={2}
      spacing={3}
      bgcolor="whitesmoke"
    >
      <Typography align="center" color= '#030303' fontSize= '24px' fontFamily= 'Roboto Mono' letterSpacing= '-0.6px' lineHeight= '32px' gutterBottom>
          <SmartToyIcon fontSize='small'></SmartToyIcon> Rate My Professor AI
      </Typography>

      <Stack
        direction={'column'}
        spacing={2}
        flexGrow={1}
        overflow="auto"
        maxHeight="100%"
        sx={{
          '&::-webkit-scrollbar': {
            width: '0.4em',
          },
          '&::-webkit-scrollbar-track': {
            boxShadow: `inset 0 0 6px ${theme.palette.divider}`,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.main,
            borderRadius: '10px',
          },
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            display="flex"
            justifyContent={
              message.role === 'assistant' ? 'flex-start' : 'flex-end'
            }
          >
            <Box
              bgcolor={
                message.role === 'assistant'
                  ? 'primary.main'
                  : 'secondary.main'
              }
              color="white"
              borderRadius={10}
              p={2}
              maxWidth= {isMobile ? '100%' : '50%'}
              maxHeight={isMobile ? '100%' : 'none'}
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </Box>
          </Box>
        ))}
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Message"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button variant="contained" onClick={sendMessage} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </Stack>
    </Stack>
  </Box>
  )
}
