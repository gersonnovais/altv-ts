import * as alt from 'alt-server';
import { EVENTS } from '../../shared/events.js';
import { MarkerSync } from '../../shared/interfaces.js';

const markers: Array<MarkerSync> = [];


const Marker = {
    init(){
        alt.log(`Marker File inicializado`);
    },
    add(pos: alt.IVector3, color: alt.RGBA, type: number){
        markers.push({pos, color, type});
        alt.emitAllClients(EVENTS.TO_CLIENT.SYNC_MARKERS, [{pos, color, type}]);
    },
    sync(player: alt.Player){
        alt.emitClient(player, EVENTS.TO_CLIENT.SYNC_MARKERS, markers);
    },

}

export default Marker;
