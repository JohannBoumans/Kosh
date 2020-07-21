

module.exports = {
  addNewDossier: (socket, groupes, mongoose) => {
    // ADD NEW DOSSIER
    socket.on('add_new_dossier',(data)=>{
      let id_gr_transformed = mongoose.Types.ObjectId(data.id_gr);
      groupes.updateOne({'_id':id_gr_transformed},{$push:{dossier:data.nom_dossier}}, function () {
        console.log('groupes updated add_new_dossier')
      } );
      console.log('try_to_add_dossier', id_gr_transformed)

    });
  },
  changeDossier: (socket, users) => {
    // CHANGEMENT DE DOSSIER (EN TEST)
    socket.on('change_dossier', (data) => {
      // SELECT USER FROM DATABASE
      users.find({user: data.id}).limit(1).toArray(function (err, res) {
        if (res.length) {
          //UPDATE STATUS IN USER TABLE
          users.updateOne({'user': data.id, 'groupes.status': 1}, {$set: {"groupes.$.dossier": data.dossier}})
          console.log('dossier updated');
          // socket.emit('rep_dossier_changed', data.dossier);
        } else {
          // CREATE NEW USER IF IT WAS NOT THE CASE --> NEED TO CHAGNE PLACE
          users.insertOne({user: data.id, status: data.status_value, groupes: [], url_rm: []}, function () {
            console.log('user added change_dosser');
          })
        }
      })
    })
  },
};
