import * as alt from 'alt-client';
import './systems/markers.js';
import './systems/playerConnects.js';

alt.onServer('log:Console', handleLogConsole);


function handleLogConsole(msg: string) {
    alt.log(msg);
}

alt.on('keyup',(key: number)=>{
    if (key === 112){
        logUserInfo();
    }
})

function logUserInfo(){
    alt.log(`ID: ${alt.Player.local.id}`);
    alt.log(`POS: ${JSON.stringify(alt.Player.local.pos)}`);
    alt.log(`ROT: ${JSON.stringify(alt.Player.local.rot)}`);
}