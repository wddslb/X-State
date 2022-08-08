import { assign, createMachine, interpret } from "xstate";
//暂定操作界面不隐藏 onmute问题
const beInvited = assign(()=>{
    console.log('you are invited');
});
const clientMachine = createMachine({
    id: 'client',
    initial: 'pending', 
    states: {
        pending: {
            on: {
                beInvited: {
                    target: 'reveiving',
                    actions: 'beInvited'
                } 
            }
        },
        receiving: {
            on: {
                inviteAccepted: 'synchronizing',
                inviteRefused: 'finished'
            }
        },
        synchronizing: {
            initial: 'waitingScreenSharing',
            states: {
                waitingScreenSharing: {
                    on: {
                        receiveScreenSharing: 'screenSharing',
                        refuseScreensharing: 'waitingScreenSharing'
                    }
                },
                screenSharing: {
                    on: {
                        exitScreenSharing: 'waitingScreenSharing',
                        rtcError: 'rtcDisconnected',
                    },
                    activities: ['updateDom', 'heartBeat']
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
                onMute: 'synchronizing',
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
        },
    }

},
{
    actions: { beInvited }
})
const machine = interpret(clientMachine).onTransition((state)=>{
    console.log(state.value);
});
machine.start()
machine.send('beInvited')
export default clientMachine