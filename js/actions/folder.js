

module.exports = {

  addNewDossier: (socket, groupes, mongoose) => {
    // ADD NEW DOSSIER
    socket.on('add_new_dossier', async (data) => {
      //try {
        let id_gr_transformed = mongoose.Types.ObjectId(data.id_gr);

        await groupes.updateOne({ _id: id_gr_transformed },{ $push: { dossier: data.nom_dossier }});

        socket.emit('init_back');

        console.log('try_to_add_dossier', id_gr_transformed)

      /*}catch (e) {
        console.error(e)
      }*/
    });
  },

  changeDossier: (socket, users) => {
    // CHANGEMENT DE DOSSIER (EN TEST)
    socket.on('change_dossier', async (data) => {

      //try {
        //await users.find({user: data.id}).limit(1).toArray();

        await users.updateOne({user: data.id, 'groupes.status': 1}, {$set: {"groupes.$.dossier": data.dossier}});

        //socket.emit('init_back')
        socket.emit('rep_dossier_changed', data.dossier);
      /*}catch (e) {
        console.error(e)
      }*/

      /*// SELECT USER FROM DATABASE
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
      })*/
    })
  },

  deleteDossier: (socket, users, groupes, mongoose) => {
    socket.on('delete_folder', async (data) => {
      try{
        const {id, folder} = data;
        let idGr = mongoose.Types.ObjectId(id);
        const groupe = await groupes.find({_id: idGr}).toArray();

        let new_folders = [];
        for (const dossier of groupe[0].dossier){
          if(dossier != folder){
            new_folders.push(dossier)
          }
        }
        console.log(new_folders, 'NEW FOLDERSS')
        await groupes.updateOne({ _id: idGr },{$set: { dossier: new_folders }});

        await users.updateOne({'groupes.id': idGr}, {$set: {"groupes.$.dossier": 'All'}});

        socket.emit('init_back')
      }catch (e) {
        console.error(e)
      }

    })
  },

};
