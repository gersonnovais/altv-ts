import * as alt from 'alt-client';
import * as native from 'natives';

alt.on('playerConnect', handlePlayerConnect);

function handlePlayerConnect(){
    let playerID = native.playerPedId()
    native.freezeEntityPosition(playerID, false)
    native.setEntityCollision(playerID, true, true)
    native.setEntityVisible(playerID, true, false)
    native.setLocalPlayerVisibleLocally(true)
    native.resetEntityAlpha(playerID)
    native.resetEntityAlpha(playerID)
    native.setEveryoneIgnorePlayer(playerID, false)
    native.setPoliceIgnorePlayer(playerID, false)
    native.resetEntityAlpha(playerID)
    native.setPoliceIgnorePlayer(playerID, true)
}