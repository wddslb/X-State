import { assign, createMachine } from "xstate";

const serverMachine = createMachine({
    id: 'server',
    initial: 'pending',
    states: {
        pending:{
            on: {
                onInviting: [
                    {
                        target: 'synchronizing',
                        cond: 'inviteAccepted'
                    },
                    {
                        target: 'finished',
                        cond: 'inviteRefused'
                    }
                ]
            }
        },
        synchronizing: {
            initial: 'waitingScreenSharing',
            states: {
                waitingScreenSharing: {
                    on: {
                        onScreenSharing: 'screenSharing'
                    }
                },
                screenSharing: {
                    states: {
                        scrolling: {
                            on: {
                                //finishScreenSharing: 'synchronizing',
                                //scrollFinished: 'screenSharing'
                            }
                        },
                        brushing: {
                            on: {
                                //finishScreenSharing: 'synchronizing',
                                //brushFinished: 'screenSharing'
                            }
                        },
                        pageChange: {}
                    },
                    on: {
                        rtcError: 'rtcDisconnected',
                        exitScreenSharing: 'waitingScreenSharing'
                    },
                    activities: 'heartBeat'
                },
                rtcDisconnected: {
                    entry: assign({
                        currentState: 'notifyRtsDisconected'
                    }),
                    on: {
                        onRtcReconnecting: 'screenSharing'
                    }
                }
            },
            on: {
                hangUp: 'finished',
                badCondition: 'disconnected'
            }
        },
        disconnected: {
            on: {
                onReconnecting: 'synchronizing'
            }
        },
        finished: {
            type: 'final'
        }
    }
})