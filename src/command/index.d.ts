export namespace Command {
  export interface init_options {
    allOrNothing: boolean
    cardCycle: boolean
    deckPlays: boolean
    detrimentalCharacters: boolean
    emptyClues: boolean
    numPlayers: number // NEW
    oneExtraCard: boolean
    oneLessCard: boolean
    speedrun: boolean
    startingPlayer: number // NEW (always 0?)
    timeBase: number
    timePerTurn: number
    timed: boolean
    variantID: number // NEW
    variantName: string
  }
  export interface table_option {
    allOrNothing: boolean // False
    cardCycle: boolean // False
    deckPlays: boolean // False
    detrimentalCharacters: boolean // False
    emptyClues: boolean // False
    oneExtraCard: boolean // False
    oneLessCard: boolean // False
    speedrun: boolean // False
    timeBase: number // 0
    timePerTurn: number // 0
    timed: boolean // False
    variantName: string // 'No Variant'
  }

  // --------
  //  we get
  // --------

  export namespace Get {
    export interface welcome {
      username: string
      playingAtTables: number[]
      // below do not matter
      datetimeShutdownInit: string
      disconSpectatingTable: number
      firstTimeUser: boolean
      friends: string[]
      maintenanceMode: boolean
      muted: boolean
      randomTableName: string
      settings: any
      shuttingDown: boolean
      totalGames: number
      userID: number
    }
    // export interface userList{}
    // export interface tableList{}
    // export interface chatList{}
    export interface chat {
      msg: string
      who: string
      discord: boolean
      server: boolean
      datetime: string
      room: string
      recipient: string
    }
    // export interface user{}
    // export interface userInactive{}
    // export interface table{}
    export interface userLeft {
      userID: number
    }
    export interface tableGone {
      tableID: number
    }
    export interface joined {
      tableID: number
    }
    export interface tableStart {
      replay: boolean
      tableID: number
    }
    export interface init {
      characterAssignments: any[]
      characterMetadata: any[]
      databaseID: number
      datetimeFinished: string
      datetimeStarted: string
      hasCustomSeed: boolean
      options: init_options
      ourPlayerIndex: number // important
      pausePlayerIndex: number
      pauseQueued: boolean
      paused: boolean
      playerNames: string[]
      replay: boolean
      seed: string
      sharedReplay: boolean
      sharedReplayEffMod: number
      sharedReplayLeader: string
      sharedReplaySegment: number
      spectating: boolean
      tableID: number
    }
    export interface gameAction_action_clue {
      type: number // 0 = color?
      value: number // 2 = (2+1)-th color/rank
    }
    export interface gameAction_action__draw {
      order: number // deck-index
      playerIndex: number
      rank: number // -1 means unknown
      suitIndex: number // -1 means unknown
      type: 'draw'
    }
    export interface gameAction_action__clue {
      clue: gameAction_action_clue
      giver: number // player index
      list: number[] // touched cards (deck-index)
      target: number // player index
      turn: number // the very first turn is 0
      type: 'clue'
    }
    export interface gameAction_action__play {
      order: number
      playerIndex: number
      rank: number
      suitIndex: number
      type: 'play'
    }
    export interface gameAction_action__status {
      clues: number
      maxScore: number
      score: number
      type: 'status'
    }
    export interface gameAction_action__discard {
      failed: boolean // true if bomb
      order: number
      playerIndex: number
      rank: number
      suitIndex: number
      type: 'discard'
    }
    export interface gameAction_action__turn {
      currentPlayerIndex: number
      num: number
      type: 'turn'
    }
    export interface gameAction_action__strike {
      order: number
      num: number
      turn: number
      type: 'strike'
    }
    type gameAction_action =
    gameAction_action__play |
    gameAction_action__discard |
    gameAction_action__clue |
    gameAction_action__draw |
    gameAction_action__status |
    gameAction_action__turn |
    gameAction_action__strike

    export interface gameActionList {
      // order:
      // 1. strike (only when discard)
      // 2. play = discard = clue
      // 3. draw (not when clue)
      // 4. status
      // 5. turn
      list: gameAction_action[]
      tableID: number
    }
    export interface gameAction {
      action: gameAction_action
      tableID: number
    }
  }

  export namespace Send {
    export interface tableStart {
      tableID: number
    }
    export interface tableReattend {
      tableID: number
    }
    export interface tableLeave {
      tableID: number
    }
    export interface getGameInfo1 {
      tableID: number
    }
    export interface getGameInfo2 {
      tableID: number
    }
    export interface chatPM {
      recipient: string
      msg: string
      room: string // 'lobby'
    }
    export interface tableCreate {
      password: string
      options: table_option
      maxPlayers: number // 5
      name: string // 'bot table'
    }
    export interface tableJoin {
      password: string
      tableID: number
    }
    export interface note {
      tableID: number
      order: number
      note: string
    }
    export interface action {
      tableID: number
      target: number // (type = 0) deck-index, (type = 2) player index
      type: number // 0 = play, 2 = clue color
      value?: number // 2 = (2+1)-th color/rank
    }
  }
}
