import * as alt from 'alt-server';
import Marker from './markers.js';

//Array de identificadores
type WeaponInfo = {weaponHash: number, identifier: string, pos: alt.IVector3};
const identifiers: Array<WeaponInfo> = [];

function getWeaponInfo(colshape: alt.Colshape): WeaponInfo | undefined{
    if(typeof colshape['identifier'] === 'undefined'){
        return undefined;
    }

    const index = identifiers.findIndex(x =>{
        if(x.identifier === colshape['identifier']){
            return true;
        }
        
        return false;
    })

    if(index <= -1){
        return undefined;
    }

    return identifiers[index];
}


function handleEntityEnterColShape(colshape: alt.Colshape, player: alt.Player) {
    const weaponGiveInfo = getWeaponInfo(colshape);
    if(typeof weaponGiveInfo === 'undefined'){
        return;
    }

    player.giveWeapon(weaponGiveInfo.weaponHash, 9999, true);
}

function handleLeaveEnterColShape(colshape: alt.Colshape, player: alt.Player){
    const weaponGiveInfo = getWeaponInfo(colshape);
    if(typeof weaponGiveInfo === 'undefined'){
        return;
    }
}

const WeaponGiver = {
    init(){
        alt.log(`Weapon Giver File registrado`);
    },
    add(pos: alt.IVector3, identifier: string, weaponHash: number, sprite: number, name: string){
        identifiers.push({
            pos,
            identifier,
            weaponHash,
        });

        const weaponColShape = new alt.ColshapeCylinder(pos.x, pos.y, pos.z, 3, 3);
        weaponColShape.playersOnly = true;
        weaponColShape['identifier'] = identifier;

        //@ts-ignore
        const blip = new alt.PointBlip(pos.x, pos.y,pos.z); // há um erro aqui pedindo 4 argumentos
        blip.sprite  = sprite;
        blip.name = name;
        blip.scale = 1;

        Marker.add(pos, new alt.RGBA(0, 255, 0,100), 1);
    },

}

export default WeaponGiver;

alt.on('entityEnterColshape', handleEntityEnterColShape)
alt.on('entityEnterColshape', handleLeaveEnterColShape)

WeaponGiver.add({"x":28.328651428222656,"y":852.6162109375,"z":196.73243713378906},"weapon-appistol-giver",alt.hash('WEAPON_APPISTOL'), 156, "APP_Pistol");

WeaponGiver.add({"x":27.72543716430664,"y":861.1123657226562,"z":196.73934936523438} ,"weapon-rpg-giver",alt.hash('WEAPON_RPG'), 157, "RPG");

