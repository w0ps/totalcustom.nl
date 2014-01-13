var materialsLoad = new $.Deferred();
materialsLoad.pendingTextures = 0;
materialsLoad.progress(function(){
  this.pendingTextures--;
  if (!this.pendingTextures) {
    this.resolve();
  }
});

var highlightMat = new THREE.MeshLambertMaterial({color: 0xFF0000, ambient: 0x3060AA}),
    tubeMaterial = new THREE.MeshLambertMaterial({color: 0x66FF66}),
    defMaterial  = new THREE.MeshLambertMaterial({color: 0x00FF00, ambient: 0x000000}),
    helpMaterial = new THREE.MeshLambertMaterial({color: 0x0000FF, opacity: 0.1, wireframe: true, side: THREE.DoubleSide }),
    roadMaterial = new THREE.MeshLambertMaterial({color: 0xFFFFFF}),
    moveIconMaterial = new THREE.MeshLambertMaterial({color: 0xFFFFFF}),
    uvTestMaterial = new THREE.MeshLambertMaterial({color: 0xFFFFFF, ambient: 0x444444})
;

loadTexture('road1.jpg', roadMaterial);
loadTexture('uvtest.jpg', uvTestMaterial);
loadTexture('moveIcon.jpg', moveIconMaterial);

var editorMaterials = {
  def: defMaterial,
  highlight: highlightMat
}

function loadTexture(filename, material, slot) {
  materialsLoad.pendingTextures++;
  
  THREE.ImageUtils.loadTexture('/textures/' + filename, {}, function(texture){
    material[slot || 'map'] = texture;
    materialsLoad.notify();
  });
}