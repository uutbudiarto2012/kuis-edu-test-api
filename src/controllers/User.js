const { knex } = require("../config/db_connection");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { attachPaginate } = require("knex-paginate");
attachPaginate();

exports.getUser = async (req, res) => {
  const paramId = parseInt(req.params.id);
  const userLogin = req.user;
  //ADMIN
  // ALL USER
  try {
    if (!paramId && userLogin.role === 1) {
      const { page, size } = req.query;
      const col = [
        "user_id",
        "username",
        "email",
        "profile_picture",
        "display_name",
        "phone",
        "level",
        "point_collection",
        "created_at",
        "updated_at",
      ];
      const result = await knex
        .column(col)
        .select()
        .from("users")
        .orderBy("user_id", "desc")
        .paginate({
          perPage: parseInt(size) || 10,
          currentPage: parseInt(page) || 1,
        });
      if (result) {
        return res.status(200).json({
          message: "Get users success!",
          data: result.data,
          pagination: result.pagination,
        });
      }
    }
    if (paramId && userLogin.role === 1) {
      const user = await knex("users").where({ role_id: 3, user_id: paramId });
      if (user[0]) {
        const { password, ...info } = user[0];
        return res.status(200).json({
          message: "Get user success!",
          data: info,
        });
      } else {
        return res.status(404).json({
          message: "User not found!",
          data: user,
        });
      }
    }

    // USER ACCESS
    if (paramId && userLogin.role === 3) {
      if (paramId !== userLogin.id)
        return res
          .status(403)
          .json({ message: "You can only get your account!" });
      const user = await knex("users").where("user_id", paramId);
      if (user) {
        const { password, ...profile } = user[0];
        return res.status(200).json({
          message: "Get user success!",
          data: profile,
        });
      }
    } else {
      return res.status(403).json({
        message: "Account unauthorized!",
        data: [],
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Request failed!",
      error: error,
    });
  }
};

exports.changePassword = async (req, res) => {
  const paramId = req.params.id;
  const currentUser = req.user;
  const { current_password, new_password } = req.body;
  if (parseInt(paramId) !== currentUser.id)
    return res.status(403).json({ message: "Access forbidden!" });
  if (current_password === new_password)
    return res.status(400).json({ message: "Password can not be same!" });
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res
      .status(400)
      .json({ message: "Bad request!", error: errors.array()[0] });

  // CHECK PASSWORD
  try {
    const current_user = await knex("users").where("user_id", currentUser.id);
    if (await bcrypt.compare(current_password, current_user[0].password)) {
      // GENERATE NEW PASSWORD
      const salt = await bcrypt.genSalt(10);
      const passHash = await bcrypt.hash(new_password, salt);
      const doChange = await knex("users")
        .where("user_id", current_user[0].user_id)
        .update({ password: passHash });
      doChange && res.status(200).json({ message: "Change password success!" });
    } else {
      return res.status(403).json({ message: "Wrong current password!" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Request failed!", error: err });
  }
};

exports.updateProfile = async (req, res) => {
  const paramId = req.params.id;
  const currentUser = req.user;
  const { display_name, phone } = req.body;
  if (parseInt(paramId) !== currentUser.id)
    return res.status(403).json({
      message: "You can only update your account!",
    });
  const data = {
    display_name: display_name,
    phone: phone,
    updated_at: new Date(),
  };
  try {
    const result = await knex("users").where("user_id", paramId).update(data);
    if (result) {
      res.status(400).json({
        message: "Update profile success!",
      });
    } else {
      res.status(400).json({
        message: "Update profile failed!",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Request failed!",
    });
  }
};

exports.updateImage = async (req, res) => {
  
  const paramId = req.params.id;
  const currentUser = req.user;
  
  if (parseInt(paramId) !== currentUser.id)
    return res.status(403).json({
      message: "You can only change your image!",
    });
    try {
    if(!req.file) return res.status(403).json({
      message: "Please upload an image only!",
    });
    const image = req.file.path;
    const data = {
      profile_picture : image,
      updated_at : new Date() 
    }
    const result = await knex('users').where('user_id',paramId).update(data)
    if(result){
      res.status(200).json({
        message: "Update image success!"
      });
    }else{
      res.status(400).json({
        message: "Update image failed!"
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Request failed!",
      error: error,
    });
  }
};
