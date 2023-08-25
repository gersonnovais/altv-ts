import * as alt from 'alt-client';
import * as native from 'natives';
import { EVENTS } from '../../shared/events.js';
import { MarkerSync } from '../../shared/interfaces.js';

const streamRange = 3;

let existingMarkers: Array<MarkerSync> = [];

function draw(){

    if(existingMarkers.length <= 0){
        return;
    }

    for(let marker of existingMarkers){
        const pos = new alt.Vector3(marker.pos.x,marker.pos.y,marker.pos.z);
        const dist = pos.distanceTo(alt.Player.local.pos);
        if(dist > streamRange){
            continue;
        }

        native.drawMarker(marker.type,pos.x,pos.y,pos.z, 0,0,0,0,0,0, 1,1,1,marker.color.r, marker.color.g, marker.color.b, marker.color.a, false, false, 2,false, undefined, undefined,false);
    }
}

function syncMarkers(markers: Array<MarkerSync>){
    existingMarkers = existingMarkers.concat(markers);
}

alt.onServer(EVENTS.TO_CLIENT.SYNC_MARKERS, syncMarkers)
alt.everyTick(draw);