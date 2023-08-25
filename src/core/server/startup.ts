import * as alt from 'alt-server';

//Eventos
import './events/playerConnect.js';

//Sistemas
import Marker from './systems/markers.js';
Marker.init();

import WeaponGiver from './systems/weaponGiver.js';
WeaponGiver.init();

alt.on('resourceStart', error =>{
    console.log(`${alt.resourceName} inicou. Detalhes: ${error}`);
})

alt.on('resourceStop', () => {
    console.log(`${alt.resourceName} parou`);
})