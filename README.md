# Mood Voting Cards

A real-time card-based voting system for stand-up mood checking. Built with Next.js, Socket.IO, and Tailwind CSS.

## Features

- 🃏 **Card-based voting** - Poker-style cards that show covers during voting
- 👑 **Admin controls** - Room creator manages the voting session
- 🎭 **Emoji + Scale voting** - Choose emoji and rate mood 1-10
- 🔄 **Real-time sync** - All participants see updates instantly
- 🎪 **Card flip reveal** - Dramatic reveal of all results together
- 📊 **Mood summary** - Average scores and common moods

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment

The app is ready for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy!

For the backend, you can use:
- **Free options**: Railway, Render, or Vercel Serverless Functions
- **Socket.IO hosting**: Socket.IO Cloud (free tier available)

## How It Works

1. **Create/Join Room**: Admin creates a room and shares the code
2. **Vote**: Participants select emoji and mood scale (1-10)
3. **Cards Stay Hidden**: All cards show as covered during voting
4. **Admin Controls**: Admin can close voting and reveal results
5. **Dramatic Reveal**: All cards flip simultaneously to show results
6. **Summary**: View average mood and most common emoji

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.IO
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── JoinRoom.tsx       # Room joining interface
│   ├── RoomLobby.tsx      # Room lobby
│   ├── VotingRoom.tsx     # Main voting interface
│   └── MoodCard.tsx       # Individual voting card
├── lib/                   # Utilities
│   ├── types.ts           # TypeScript types
│   └── socket.ts          # Socket.IO client
├── pages/api/             # API routes
│   └── socket.ts          # Socket.IO server
└── package.json
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

For production, update the socket URL to your deployed backend.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your team stand-ups!
