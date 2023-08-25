import * as alt from 'alt-server';

alt.onClient("no-clip:ChangePosition", (player: alt.Player, newPosition: alt.Vector3) => {
    player.pos = newPosition;
});