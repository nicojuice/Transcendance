import * as BABYLON from "@babylonjs/core";

// === Terrain and border construction ===
export function buildTerrain(scene: BABYLON.Scene): void {
  const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
  //groundMat.emissiveColor = new BABYLON.Color3(0, 22.7 / 255.0, 45.0 / 255.0);
  groundMat.emissiveColor = new BABYLON.Color3(1,1,1);
  groundMat.diffuseColor = groundMat.emissiveColor;
  groundMat.alpha = 0.05;

  const borderMat = new BABYLON.StandardMaterial("borderMat", scene);
  borderMat.emissiveColor = new BABYLON.Color3(57.3 / 255.0, 1.0, 1.0);
  borderMat.diffuseColor = borderMat.emissiveColor;

  const borderMat2 = new BABYLON.StandardMaterial("borderMat2", scene);
  borderMat2.diffuseColor = new BABYLON.Color3(0, 38.4 / 255.0, 55.3 / 255.0);
  borderMat2.emissiveColor = borderMat2.diffuseColor;


  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 30, height: 20 }, scene);
  ground.material = groundMat;

  const border1 = BABYLON.MeshBuilder.CreateCapsule("border1", {
    radius: 0.25,
    height: 30,
    subdivisions: 2,
    tessellation: 6
  }, scene);

  const subborder = border1.clone("subborder");
  subborder.scaling = new BABYLON.Vector3(0.98, 1, 1.25);
  subborder.material = borderMat2;
  subborder.parent = border1;

  border1.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, 0);
  border1.position = new BABYLON.Vector3(0, 0, 10);
  border1.material = borderMat;

  const border2 = border1.clone("border2");
  border2.position = new BABYLON.Vector3(0, 0, -10);


  const borderMatLimit = new BABYLON.StandardMaterial("borderMatLimit", scene);
  borderMatLimit.diffuseColor = new BABYLON.Color3(0.5, 0, 0.5);
  borderMatLimit.emissiveColor = borderMatLimit.diffuseColor;
  borderMatLimit.alpha = 0.6;

  const borderLimit = BABYLON.MeshBuilder.CreateCapsule("border1", {
    radius: 0.1,
    height: 20,
    subdivisions: 2,
    tessellation: 6
  }, scene);
  borderLimit.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
  borderLimit.position = new BABYLON.Vector3(14.85, 0, 0);
  borderLimit.material = borderMatLimit;
  const borderLimit2 = borderLimit.clone("border2");
  borderLimit2.position = new BABYLON.Vector3(-14.85, 0, 0);
}

//Spawn function for the player
/*export function spawn_players(scene: BABYLON.Scene): BABYLON.Mesh[] {
  const players: BABYLON.Mesh[] = [];
  const player1 = spawn_pacman(scene);
  players.push(player1);
  return players;
}*/