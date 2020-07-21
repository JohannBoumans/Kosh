
module.exports = {
  initPopup: (socket, users, groupes, kosh, kosh_gr) => {
    // INIT OF POPUP.HTML ---> data = id of client
    socket.on('init_popup', (data) => {
      console.log(data, 'data')
      // FIND USER WHO REQUESTED INFORMATIONS
      users.find({user: data}).limit(1).toArray(function (err, res) {

        if (res === undefined || !res.length || res.length === 0) {
          // CREATE NEW USER IF IT WAS NOT THE CASE --> NEED TO CHANGE PLACE
          users.insertOne({user: data, status: 1, groupes: [], url_rm: []}, function () {
            console.log('user added init pop');
          })
        }
        let obj_gr_user = {};
        let tab_name_gr = [];
        let tab_kosh_gr = [];
        // HANDLE THE GROUPS OF USER


        //res[0].groupes undefined au demarrage car pas de user? passe pas dans la condition au dessus
        //let groupes;
        //res[0].groupes !== undefined ? groupes = res[0].groupes : groupes = [];

        if(res[0] !== undefined){
          console.log(res[0], 'res0')
          for (let x = 0; x < res[0].groupes.length; x++) {
            // SELECT GROUPS OF USER IN DATABASE

            groupes.find({_id: res[0].groupes[x].id}).limit(1).toArray(function (errr, rep) {

              obj_gr_user = {
                id: rep[0]._id,
                name: rep[0].name,
                description: rep[0].description,
                public: rep[0].public,
                contributor: rep[0].contributor,
                dossier: rep[0].dossier
              };
              tab_name_gr.push(obj_gr_user);
              console.log('EN TRAVAIL --->', tab_name_gr)
              // SELECT TEXTS KOSHED FROM GROUPES
              if (res[0].groupes[x].dossier !== undefined) {
                console.log(res[0].groupes[x].dossier, 'dossier')
                console.log('TRAVAIL0');


                if (res[0].groupes[x].dossier.toLowerCase() !== 'all') {
                  kosh_gr.find({$and: [{gr: res[0].groupes[x].id}, {dossier: res[0].groupes[x].dossier}]}).sort({_id: -1}).limit(10).toArray(function (error_kosh_gr, res_kosh_gr) {


                    tab_kosh_gr.push(res_kosh_gr);
                    // EMIT TO CLIENT IN THE LAST ITERATION

                    if (x === res[0].groupes.length - 1) {

                      // EMIT A OBJECT WITH {res:info_about_user, gr: info_about_groups, kosh_gr: text_koshed_from_groups}
                      socket.emit('rep_init_popup', {res: res, gr: tab_name_gr, kosh_gr: tab_kosh_gr});
                      console.log('TRAVAIL1');
                    }

                  })
                } else {
                  kosh_gr.find({gr: res[0].groupes[x].id}).sort({_id: -1}).limit(10).toArray(function (error_kosh_gr, res_kosh_gr) {


                    tab_kosh_gr.push(res_kosh_gr);
                    // EMIT TO CLIENT IN THE LAST ITERATION
                    if (x === res[0].groupes.length - 1) {

                      // EMIT A OBJECT WITH {res:info_about_user, gr: info_about_groups, kosh_gr: text_koshed_from_groups}
                      socket.emit('rep_init_popup', {res: res, gr: tab_name_gr, kosh_gr: tab_kosh_gr});
                      console.log('TRAVAIL2');
                    }

                  })

                }
              }


            })
          }
        }


      })
      // INIT MY ACTIVITY
      kosh.find({user: data}).sort({_id: -1}).limit(10).toArray(function (err, res) {
        socket.emit('init_activity', res);
      })
    })
  },

  checkUrl: (socket, users) => {
    //CHECK IF URL IS DISABLE OF NOT
    socket.on('check_url', (data) => {
      console.log('ON check_url')
      users.find({user: data.id}).limit(1).toArray(function (err, res) {
        let url_user;
        res[0] !== undefined ? url_user = res[0].url_rm : url_user = [];
        // console.log("RESSSS----->", res);
        if (res === undefined || !res.length) {
          // CREATE NEW USER IF IT WAS NOT THE CASE --> NEED TO CHAGNE PLACE
          users.insertOne({user: data.id, status: 1, groupes: [], url_rm: []}, function () {
            console.log('user added check url');
          })
        }
        let url_find = 0;
        for (let x = 0; x < url_user.length; x++) {
          if (data.url.indexOf(url_user[x]) !== -1) {
            url_find = 1;
            break;
          }
        }
        if (url_find === 0) {
          socket.emit('url_checked');
          //socket.emit('url_on');
          console.log('check_url EMIT url_checked')
        } else {
          socket.emit('url_on');
          console.log('check_url EMIT url_on')
        }
      })
    })
  },

  changeUrlStatus: (socket, users) => {
    // UPDATE L'URL LORSQU'ON REACTIVE KOSH SUR UNE NOUVELLE PAGE
    socket.on('change_url_status', (data) => {
      console.log('ON change_url_status')
      users.find({user: data.user}).limit(1).toArray(function (err, res) {
        if (res.length > 0) {
          let new_url_on = [];
          let url_find = 0;
          for (let x = 0; x < res[0].url_rm.length; x++) {
            if (data.url.indexOf(res[0].url_rm[x]) === -1) {
              new_url_on.push(res[0].url_rm[x]);
            } else {
              url_find = 1;
            }
          }
          if (url_find === 0 || data.on === 1) {
            let url_to_split = data.url.split('//')[1];
            let new_url = url_to_split.split('/')[0];
            console.log(new_url_on, 'db-->url', new_url)
            new_url_on.push(new_url);
            console.log(new_url_on, 'change_url_status_ NEW URL')
          }


          users.updateOne({'user': data.user}, {$set: {'url_rm': new_url_on}}, function () {
            console.log('change_url_status_USER_URL_UPDATED')
          })
        }
      })


    });
  },

  statusChanged: (socket, users) => {
    // UPTDATE USER STATUS
    socket.on('status_changed', (data) => {
      console.log('ON status_changed')
      // SELECT USER FROM DATABASE
      users.find({user: data.id}).limit(1).toArray(function (err, res) {
        if (res.length) {
          //UPDATE STATUS IN USER TABLE //
          users.updateOne({'user': data.id}, {$set: {'status': data.status_value}})
          console.log('user updated status changed');
          socket.emit('rep_status_changed', data.status_value);
        } else {
          // CREATE NEW USER IF IT WAS NOT THE CASE --> NEED TO CHAGNE PLACE
          users.insertOne({user: data.id, status: data.status_value, groupes: [], url_rm: []}, function () {
            console.log('user added status_changed');
          })
        }
      })
    })
  },

  likeKoshGr: (socket, kosh_gr, mongoose) => {
    // ADD LIKE ON TEXT IN KOSH GROUPE
    socket.on('like_kosh_gr', (data) => {

      let pt = data.point + 1;
      let id_grp = mongoose.Types.ObjectId(data.gr);

      kosh_gr.updateOne(
        {$and: [{url: data.url}, {gr: id_grp}, {texte: data.texte}]},
        {$set: {point: pt}}
      );


    })
  },

  removeKoshGr: (socket, kosh_gr, mongoose) => {
    // REMOVE LIKE ON TEXT IN KOSH GROUPE
    socket.on('remove_kosh_gr', (data) => {
      let id_grp = mongoose.Types.ObjectId(data.gr);
      kosh_gr.find({$and: [{url: data.url}, {gr: id_grp}, {texte: data.texte}]}).toArray(function (err, res) {
        if (res.length) {
          console.log('OLA', res[0].point)
          let nbr_like = res[0].point - 1;
          if (nbr_like < 1) {
            console.log('HALO', res[0].point)
            kosh_gr.deleteOne({_id: res[0]._id});
          } else {
            kosh_gr.updateOne(
              {_id: res[0]._id},
              {$set: {point: nbr_like}}
            );
          }
        }
      })

    })
  },

  removeKosh: (socket, kosh, kosh_gr) => {
    // DELETE MY KOSH
    socket.on('remove_kosh', (data) => {
      // kosh.deleteOne( {$and:[ {url:data.url},{texte:data.texte},{user:data.id_user} ]} );
      kosh.deleteMany({url: data.url, texte: data.texte, user: data.id_user});
      kosh_gr.deleteMany({url: data.url, texte: data.texte, user: data.id_user});

    })
  },

  copyMine: (socket, kosh) => {
    // COPY // COPY YOUR KOSH??
    socket.on('copy_mine', (data) => {
      console.log(data)
      if (data !== undefined && data !== null) {
        kosh.find({$and: [{url: data.url}, {user: data.user}]}).limit(100).sort({_id: 1}).toArray(function (err, res) {
          socket.emit('copy_mine', res);
        })
      }

    })
  },

  copyGr: (socket, users, kosh_gr) => {
    // COPY GROUP'S KOSH??
    socket.on('copy_gr', (data) => {
      if (data !== undefined && data !== null) {
        console.log(data.user)
        //let id_user_1 = mongoose.Types.ObjectId(data.user.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        users.find({user: data.user}).limit(100).sort({_id: 1}).toArray(function (err, res) {
          if (res) {
            console.log(res)
            for (let y = 0; y < res[0].groupes.length; y++) {
              if (res[0].groupes[y].status === 1) {
                kosh_gr.find({$and: [{url: data.url}, {gr: res[0].groupes[y].id}]}).sort({_id: -1}).toArray(function (err, res) {
                  socket.emit('copy_gr', res);
                })
              }
            }
          }
        })
      }
    })
  },

  input: (socket, client, kosh, users, kosh_gr) => {
    // WHEN USER UNDERLINE SOMETHING --> QUAND QUELQU'UN KOSH QQCH
    socket.on('input', function (data) {
      console.log('ON input');

      // variables recues par les sockets
      let url = data.url;
      let texte = data.texte;
      let div = data.div;
      let user = data.user;
      let last_search = data.last_search;
      let page = data.page;
      console.log(page)

      // Insert message
      // ON SUPPRIME LES DOUBLONS
      kosh.deleteMany({url: url, user: user, texte: texte});


      kosh.insertOne({
        url: url,
        texte: texte,
        div: div,
        user: user,
        last_search: last_search,
        page: page
      }, function (err, res) {
        socket.emit('output', res.ops);
        // socket.broadcast.emit('output', res.ops);


        users.find({user: user}).limit(1).sort({_id: 1}).toArray(function (err, res) {

          if (res[0]) {
            let user_gr = res[0].groupes;

            for (let y = 0; y < user_gr.length; y++) {
              if (user_gr[y].status == 1) {
                console.log('etape 1');
                // ON SUPPRIME LES DOUBLONS DES GROUPES
                kosh_gr.deleteMany({url: url, user: user, texte: texte});

                kosh_gr.insertOne({
                  url: url,
                  texte: texte,
                  div: div,
                  gr: user_gr[y].id,
                  last_search: last_search,
                  user: user,
                  point: 1,
                  page: page,
                  dossier: user_gr[y].dossier
                }, function (err, res) {
                  socket.join('groupe1');
                  client.to('groupe1').emit('test_room', {test: 'ca marche pour la room'});

                  //socket.emit('output_gr', res.ops);
                  // socket.broadcast.emit('output_gr', res.ops);
                })
              }
            }
          }
        })
      })

    });
  },

  connected: (socket, kosh) => {
    // NEW CONNECTION FROM CLIENT
    socket.on('connected', function (data) {

      // Get texte underlined from mongo collection

      kosh.find({$and: [{url: data.url}]}).limit(50).sort({_id: 1}).toArray(function (err, res) {

        if (err) {

          throw err;
        }

        // Emit the messages

        socket.emit('output', res);
      });

    })
  },


  getGroupes: (socket, users) => {
    // EMIT LES GROUPES DU USER POUR l'URL DE LA PAGE
    socket.on('get_groupes', (data) => {
      users.find({user: data.id}).limit(1).toArray(function (err, res) {
        socket.emit('rep_groupes', res);
      })
    })
  },

  room: (socket, client, kosh_gr, mongoose) => {
    // JOIN TOUTES LES ROOMS DU USER
    socket.on('room', function (data) {
      socket.join(data.room);
      let id_room = mongoose.Types.ObjectId(data.room);
      kosh_gr.find({$and: [{gr: id_room}, {url: data.url}, {dossier: data.dossier}]}).limit(50).toArray(function (err, res) {
        client.in(data.room).emit('msg_grp', res);
      })
    });
  },




};