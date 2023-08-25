import * as alt from 'alt-client';
import * as native from 'natives';
import * as shared from '../shared/shared.js';

let IsNoClipping        = false;
let PlayerPed           = null;
let NoClipEntity        = null;
let NoClipAlpha         = null;
let PlayerIsInVehicle   = false;
let everyTick           = null;
let PedFirstPersonNoClip      = true       
let VehFirstPersonNoClip      = false      


function DisabledControls(){
    native.hudForceWeaponWheel(false)
}

let IsPedDrivingVehicle = function(veh: number){
    return alt.Player.local.scriptID ==  native.getPedInVehicleSeat(veh, -1, false)
}

let SetupCam = function(){
    const entityRot = native.getEntityRotation(NoClipEntity,2)
    const DEFAULT_SCRIPTED_CAMERA = alt.hash("DEFAULT_SCRIPTED_CAMERA")
    const Coords = native.getEntityCoords(NoClipEntity, false);
    const Rot = new alt.Vector3(0.0, 0.0, entityRot.z);
}

function MoveForward(camRot: alt.IVector3) {
    let rotInRad = {
        x: camRot.x * (Math.PI / 180),
        y: camRot.y * (Math.PI / 180),
        z: camRot.z * (Math.PI / 180) + Math.PI / 2,
    };

    let camDir = {
        x: Math.cos(rotInRad.z),
        y: Math.sin(rotInRad.z),
        z: Math.sin(rotInRad.x),
    };

    return camDir;
}

function MoveRight(camRot: alt.IVector3) {
    let rotInRad = {
        x: camRot.x * (Math.PI / 180),
        y: camRot.y * (Math.PI / 180),
        z: camRot.z * (Math.PI / 180),
    };

    var camDir = {
        x: Math.cos(rotInRad.z),
        y: Math.sin(rotInRad.z),
        z: Math.sin(rotInRad.x),
    };

    return camDir;
}

function addSpeed(vector1: alt.IVector3, vector2: alt.IVector3, speed: number, lr = false) {
    return new alt.Vector3(
        vector1.x + vector2.x * speed,
        vector1.y + vector2.y * speed,
        lr === true ? vector1.z : vector1.z + vector2.z * speed
    );
}

function Vequals(vector1: alt.IVector3, vector2: alt.IVector3) {
    return (
        vector1.x === vector2.x &&
        vector1.y === vector2.y &&
        vector1.z === vector2.z
    );
}

let RunNoClipThread = function(){
    DisabledControls();
    let playerPos = alt.Player.local.pos;
    let speed = shared.CONFIG.SPEED;
    let rot = native.getGameplayCamRot(2);
    let dirForward = MoveForward(rot);
    let dirRight = MoveRight(rot);
    

    if (native.isDisabledControlPressed(0, shared.CONFIG.KEYS.SHIFT))
        speed = speed * 5;

    if (native.isDisabledControlPressed(0, shared.CONFIG.KEYS.FORWARD))
        playerPos = addSpeed(playerPos, dirForward, speed);

    if (native.isDisabledControlPressed(0, shared.CONFIG.KEYS.BACKWARD))
        playerPos = addSpeed(playerPos, dirForward, -speed);

    if (native.isDisabledControlPressed(0, shared.CONFIG.KEYS.LEFT))
        playerPos = addSpeed(playerPos, dirRight, -speed, true);

    if (native.isDisabledControlPressed(0, shared.CONFIG.KEYS.RIGHT))
        playerPos = addSpeed(playerPos, dirRight, speed, true);

    let z = 0;
    if (native.isDisabledControlPressed(0,shared.CONFIG.KEYS.UP))
        z += speed;

    if (native.isDisabledControlPressed(0, shared.CONFIG.KEYS.DOWN))
        z -= speed;

    let changedVector = new alt.Vector3(playerPos.x,playerPos.y,playerPos.z + z)
    if(!Vequals(changedVector, alt.Player.local.pos))
            alt.emitServer("no-clip:ChangePosition",changedVector);

    //native.requestCollisionAtCoord(coords.x, coords.y, coords.z)

    native.freezeEntityPosition(NoClipEntity, true)
    native.setEntityCollision(NoClipEntity, false, false)
    native.setEntityVisible(NoClipEntity, false, false)
    native.setEntityInvincible(NoClipEntity, true)
    native.setLocalPlayerVisibleLocally(false)
    native.setEntityAlpha(NoClipEntity, 0, false)
    if (PlayerIsInVehicle == true) {
        native.setEntityAlpha(PlayerPed, NoClipAlpha, false)
    }
    native.setEveryoneIgnorePlayer(PlayerPed, true)
    native.setPoliceIgnorePlayer(PlayerPed, true)
}

let StopNoClip = function() {
    native.freezeEntityPosition(NoClipEntity, false)
    native.setEntityCollision(NoClipEntity, true, true)
    native.setEntityVisible(NoClipEntity, true, false)
    native.setLocalPlayerVisibleLocally(true)
    native.resetEntityAlpha(NoClipEntity)
    native.resetEntityAlpha(PlayerPed)
    native.setEveryoneIgnorePlayer(PlayerPed, false)
    native.setPoliceIgnorePlayer(PlayerPed, false)
    native.resetEntityAlpha(NoClipEntity)
    native.setPoliceIgnorePlayer(PlayerPed, true)

    if (native.getVehiclePedIsIn(PlayerPed, false) != 0){
        while ((!native.isVehicleOnAllWheels(NoClipEntity)) && !IsNoClipping){
            alt.Utils.wait(1)
        }
        while (!IsNoClipping) {
            alt.Utils.wait(1)
            if (native.isVehicleOnAllWheels(NoClipEntity)) {
                return native.setEntityInvincible(NoClipEntity, false)
            }
        }
    }else{
        if ((native.isPedFalling(NoClipEntity) && Math.abs(1 - native.getEntityHeightAboveGround(NoClipEntity)) > 1.00)) {
            while ((native.isPedStopped(NoClipEntity) || !(native.isPedFalling(NoClipEntity))) && !IsNoClipping) {
                alt.Utils.wait(1)
            }
        }
        while (!IsNoClipping){
            alt.Utils.wait(1)
            if ((!native.isPedFalling(NoClipEntity)) && (!native.isPedRagdoll(NoClipEntity))) {
                return native.setEntityInvincible(NoClipEntity, false)
            }
        }
    }
}

let ToggleNoClip = function(state: boolean){
    IsNoClipping = state || !IsNoClipping
    PlayerPed    = native.playerPedId()
    PlayerIsInVehicle = native.isPedInAnyVehicle(PlayerPed, false)
   if (PlayerIsInVehicle != false && IsPedDrivingVehicle(native.getVehiclePedIsIn(PlayerPed, false))){
        NoClipEntity = native.getVehiclePedIsIn(PlayerPed, false)
        native.setVehicleEngineOn(NoClipEntity, !IsNoClipping, true, IsNoClipping)
        NoClipAlpha = PedFirstPersonNoClip == true ? 0 : 51
    }else{
       NoClipEntity = PlayerPed
       NoClipAlpha = VehFirstPersonNoClip == true ? 0 : 51
    }

    if (IsNoClipping) {
       native.freezeEntityPosition(PlayerPed,true)
       SetupCam()
       native.playSoundFromEntity(-1, "SELECT", PlayerPed, "HUD_LIQUOR_STORE_SOUNDSET", false, 0)
       
       if (!PlayerIsInVehicle){
            native.clearPedTasksImmediately(PlayerPed)
            if (PedFirstPersonNoClip){
                alt.Utils.wait(1000) // Espera o efeito
            }
       }else{
            if (VehFirstPersonNoClip){
                alt.Utils.wait(1000) // Espera o efeito
           }
       }

    }else{
        alt.clearEveryTick(everyTick);
       alt.Utils.wait(50)
       StopNoClip()
       native.playSoundFromEntity(-1, "CANCEL", PlayerPed, "HUD_LIQUOR_STORE_SOUNDSET", false, 0)
       native.freezeEntityPosition(PlayerPed,false)
    }
   
    native.setUserRadioControlEnabled(!IsNoClipping)
   
    if (IsNoClipping) {
        everyTick = alt.everyTick(RunNoClipThread);
    }
}

alt.on('keyup',(key: number)=>{
    if (key === 113){ // F2
        ToggleNoClip(!IsNoClipping)
    }
})

