import passport from "passport";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import paginate from "express-paginate";
import moment from "moment-timezone";
import routes from "../routes";
import User from "../models/User";
import NewsCategory from "../models/NewsCategory";
import News from "../models/News";
import PartnerLogo from "../models/PartnerLogo";
import MainVideo from "../models/MainVideo";
import MostVideo from "../models/MostVideo";
import Mission from "../models/Mission";
import Save from "../models/Save";
import Conference from "../models/Conference";
import Comment from "../models/Comment";
import ConferenceLike from "../models/ConferenceLike";
import BlockList from "../models/BlockList";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 관리자 로그인
export const getAdminLogin = (req, res) => {
  try {
    if (req.user) {
      res.send(`<script>location.href="${routes.admin}${routes.adminUser}"</script>`);
    } else {
      res.render("admin/adminLogin");
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postAdminLogin = (req, res, next) => {
  try {
    passport.authenticate("local", (err, user, _) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.send(
          `<script>alert("Check your login ID or password again.");\
          location.href="${routes.admin}"</script>`
        );
      } else {
        if (user.role === "general") {
          return res.send(
            `<script>alert("Please wait until the manager approves it.");\
              location.href="${routes.admin}"</script>`
          );
        } else {
          req.logIn(user, (e) => {
            if (err) {
              return next(e);
            }
            return res.send(`<script>location.href="${routes.admin}${routes.adminUser}"</script>`);
          });
        }
      }
    })(req, res, next);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// 회원가입
export const getAdminRegister = (req, res) => {
  try {
    if (req.user) {
      res.send(`<script>location.href="${routes.admin}${routes.adminUser}"</script>`);
    } else {
      res.render("admin/adminRegister");
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postAdminRegister = async (req, res) => {
  try {
    const { body } = req;
    body.role = "general";
    body.name === "Admin";
    if (body.password !== body.password2) {
      res.send(
        `<script>\
          alert("Please confirm password.");\
          location.href="${routes.admin}"\
        </script>`
      );
    } else {
      try {
        body.createdAt = moment(new Date()).tz("Asia/Seoul");
        body.updatedAt = moment(new Date()).tz("Asia/Seoul");
        const user = await User(body);
        await User.register(user, body.password);
        res.send(
          `<script>\
            alert("Please wait until the manager approves it.");\
            location.href="${routes.admin}"\
          </script>`
        );
      } catch (err) {
        console.log(err);
        res.send(
          `<script>alert("An error has occurred.:\\r\\n${err}");\
          location.href="${routes.admin}"</script>`
        );
      }
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}"); \
      location.href="${routes.admin}"</script>`
    );
  }
};

// 로그아웃
export const adminLogout = (req, res) => {
  try {
    req.logout();
    req.session.destroy(() => {
      res.send(`<script>location.href="${routes.admin}"</script>`);
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// 비밀번호 변경
export const getAdminChangePW = (req, res) => {
  try {
    res.render("admin/adminChangePW");
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postAdminChangePW = async (req, res) => {
  try {
    const {
      body: { newPassword, newPassword1 },
    } = req;
    if (newPassword !== newPassword1) {
      res.send(`<script>\
                  alert("Please confirm password.");\
                  history.go(-1);\
                </script>`);
    } else {
      const user = await User.findById({ _id: req.user._id });
      await user.setPassword(newPassword);
      await user.save();

      req.logout();
      req.session.destroy((e) => {
        console.log(e);
        res.send(
          `<script>alert("Your password has been reset successfully.");\
          location.href="${routes.admin}"</script>`
        );
      });
    }
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// 관리자 계정 관리
export const adminUser = async (req, res) => {
  try {
    const findQuery = { $or: [{ role: "admin" }, { role: "master" }, { role: "general" }] };
    const [adminItems, totalCount] = await Promise.all([User.find(findQuery).sort({ createdAt: -1 }).limit(req.query.limit).skip(req.skip).exec(), User.countDocuments(findQuery)]);
    const pageCount = Math.ceil(totalCount / req.query.limit);
    const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);

    // 엑셀 다운로드용 전체 데이터
    const excelData = await User.find(findQuery).sort({ createdAt: -1 });

    res.render("admin/adminUser", {
      adminNameKo: "Admin Account",
      adminLink: routes.adminUser,
      limit: req.query.limit,
      adminItems,
      totalCount,
      pageCount,
      pages,
      excelData,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const adminUserApprove = async (req, res) => {
  try {
    const {
      params: { userID },
    } = req;
    await User.findByIdAndUpdate(userID, { role: "admin" });
    res.send(
      `<script>\
        alert("It's been approved.");\
        location.href="${routes.admin}${routes.adminUser}"\
      </script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const adminUserDelete = async (req, res) => {
  try {
    const {
      params: { userID },
    } = req;
    // 탈퇴할 회원의 컨퍼런스글에 누른 좋아요 제거
    const conferenceIDs = await Conference.find({ userID }).distinct("_id");
    await ConferenceLike.deleteMany({ conferenceID: { $in: conferenceIDs } });
    await Comment.deleteMany({ conferenceID: { $in: conferenceIDs } });
    // 탈퇴한 회원이 누른 다른 컨퍼런스의 좋아요 제거
    const conferenceLikesIDs = await ConferenceLike.find({ fromUser: userID }).distinct("_id");
    await Conference.updateMany({}, { $pull: { conferenceLikeID: { $in: conferenceLikesIDs } } });

    // 탈퇴할 회원이 다른 컨퍼런스에 작성한 코멘트 제거
    const commentIDs = await Comment.find({ userID }).distinct("_id");
    await Conference.updateMany({}, { $pull: { commentID: { $in: commentIDs } } });

    // 컨퍼런스 탈퇴할 회원이 누른 좋아요 삭제
    await ConferenceLike.deleteMany({ fromUser: userID });
    // 컨퍼런스 댓글 삭제
    await Comment.deleteMany({ userID });
    // 컨퍼런스 삭제
    await Conference.deleteMany({ userID });
    await User.findByIdAndDelete(userID);
    res.send(
      `<script>\
        alert("It's been deleted.");\
        location.href="${routes.admin}${routes.adminUser}"\
      </script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// 뮤지션 계정 관리
export const adminMusician = async (req, res) => {
  try {
    const {
      query: { searchKey, searchValue, limit },
    } = req;

    let findQuery = { $or: [{ role: "musician" }, { role: "musicianAwait" }] };

    // 검색 기능이 있을 경우
    const searchArr = [{ code: "0", title: "userID", value: "userID" }];
    if (searchKey && searchValue) {
      findQuery[`${searchArr[parseInt(searchKey, 10)].value}`] = { $regex: searchValue, $options: "i" };
    }

    const [adminItems, totalCount] = await Promise.all([User.find(findQuery).sort("-createdAt").limit(limit).skip(req.skip).exec(), User.countDocuments(findQuery)]);
    const pageCount = Math.ceil(totalCount / limit);
    const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);

    // 엑셀 다운로드용 전체 데이터
    const excelData = await User.find(findQuery).sort({ createdAt: -1 });

    res.render("admin/adminMusician", {
      adminNameKo: "Musician Account",
      adminLink: routes.adminMusician,
      limit,
      searchArr,
      searchKey,
      searchValue,
      adminItems,
      totalCount,
      pageCount,
      pages,
      excelData,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const adminMusicianApprove = async (req, res) => {
  try {
    const { body } = req;
    // const musician = await User.findByIdAndUpdate(userID, { role: "musician" });
    await User.updateMany({ _id: { $in: body.musicianID } }, { role: "musician" });

    const musician = await User.find({ _id: { $in: body.musicianID } });
    // ========================================
    // 관리자가 뮤지션 승인했을 때
    musician.forEach((x) => {
      const msg = {
        to: x.userID,
        from: "Info@chartinmusic.com",
        subject: "[CHARTIN] Congrats. You're now an official member of CHARTIN. ",
        html: `
  <div role="article" aria-roledescription="email" aria-label="Welcome to PixInvent 👋" lang="en">
    <table style="font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; width: 100%;' width='100%' cellpadding='0' cellspacing='0' role='presentation">
      <tbody>
        <tr>
          <td align="center" style="--bg-opacity: 1; background-color: #eceff1; background-color: rgba(236, 239, 241, var(--bg-opacity)); font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif;' bgcolor='rgba(236, 239, 241, var(--bg-opacity))">
            <table class="sm-w-full" style="font-family: 'Montserrat',Arial,sans-serif; max-width: 600px;' width='600' cellpadding='0' cellspacing='0' role='presentation">
              <tbody>
                <tr>
                  <td class="sm-px-24" align="center" style="font-family: 'Montserrat',Arial,sans-serif; max-width:500px; ">
                    <table style="font-family: 'Montserrat',Arial,sans-serif; width: 100%;' width='100%' cellpadding='0' cellspacing='0' role='presentation background-color: #16151a;">
                      <tbody>
                        <tr>
                          <td class="sm-px-24" style="background-color: #16151a; --bg-opacity: 1; border-radius: 4px; font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; font-size: 14px; line-height: 24px; padding: 48px; text-align: left; --text-opacity: 1; color: #fff; "><a href="https://chartinmusic.com"><img src="https://chartin.s3.ap-northeast-2.amazonaws.com/logo/logo_basic%403x.png" width="155" style="border: 0; max-width: 100%; line-height: 100%; vertical-align: middle; margin-bottom: 30px;"/></a>
                            <p style="font-weight: 600; font-size: 18px; margin-bottom: 0; color: #fff;">Congrats! We've reviewed your bio carefully and decided to move forward. You're now an official member of Chartin.</p>
                            <p style="margin: 24px 0;">We only accept 5% to 10% of total applicants, so this means you are one of our few best musicians. However, please be aware that any illegal or inappropriate activities can dispel your membership.</p>
                            <p style="margin: 24px 0;">So what to do now: All musicians can now request services <a href="https://www.chartinmusic.com/user/service-request" style="font-weight: 600; font-size: 18px; margin-bottom: 0; color: #10eb73;">here. </a> If you're not sure which service to request, use of <a href="https://www.chartinmusic.com/user/service-diagnosis" style="font-weight: 600; font-size: 18px; margin-bottom: 0; color: #10eb73;"> service diagnosis.</p>
                            <p style="margin: 24px 0;">If you have any questions, please don't hesitate to contact us at info@chartinmusic.com</p>
                            <table style="font-family: 'Montserrat',Arial,sans-serif;' cellpadding='0' cellspacing='0' role='presentation">
                              <tbody>
                                <tr>
                                  <td style="mso-padding-alt: 16px 24px; --bg-opacity: 1; background-color: #10eb73; border-radius: 4px; font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif;' bgcolor='rgba(115, 103, 240, var(--bg-opacity))"><a href="https://www.chartinmusic.com" style="display: block; font-weight: 600; font-size: 14px; line-height: 100%; padding: 5px 24px; --text-opacity: 1; color: #ffffff; text-decoration: none; background-color: #10eb73;border-radius: 4px;">CHARTIN →</a></td>
                                </tr>
                              </tbody>
                            </table>
                            <table style="font-family: 'Montserrat',Arial,sans-serif; width: 100%;' width='100%' cellpadding='0' cellspacing='0' role='presentation">
                              <tbody>
                                <tr>
                                  <td style="font-family: 'Montserrat',Arial,sans-serif; padding-top: 32px; padding-bottom: 32px;">
                                    <div style="--bg-opacity: 1; background-color: #eceff1; background-color: rgba(236, 239, 241, var(--bg-opacity)); height: 1px; line-height: 1px;">‌</div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <p style="margin: 0 0 16px;">Thanks, <br/>CHARTIN Team</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family: 'Montserrat',Arial,sans-serif; height: 20px;' height='20"></td>
                        </tr>
                        <tr style="display: flex; flex-direction: column; justify-content:center; align-items: center">
                          <td style="margin-bottom: 20px; font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; font-size: 12px; padding-left: 48px; padding-right: 48px; --text-opacity: 1; color: #eceff1; color: rgba(236, 239, 241, var(--text-opacity));">
                            <p style="--text-opacity: 1; color: #263238; color: rgba(38, 50, 56, var(--text-opacity)); text-align: center;">Use of our service and website is subject to our <a class="hover-underline" href="https://chartinmusic.com/terms-of-use" style="--text-opacity: 1; color: #7367f0; text-decoration: none;">Terms of Use </a>and <a class="hover-underline" href="https://chartinmusic.com/privacy-policy" style="--text-opacity: 1; color: #7367f0; color: rgba(115, 103, 240, var(--text-opacity)); text-decoration: none;">Privacy Policy</a>.</p>
                          </td>
                          <td style="font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; font-size: 12px; padding-left: 48px; padding-right: 48px; --text-opacity: 1; color: #eceff1; color: rgba(236, 239, 241, var(--text-opacity));">
                            <p style="--text-opacity: 1; color: #263238; color: rgba(38, 50, 56, var(--text-opacity)); text-align: center;">Don't you want to subscribe? <a class="hover-underline" href="https://chartinmusic.com/user/sign-in/unsubscribe" style="--text-opacity: 1; color: #7367f0; text-decoration: none;">Unsubscribe</a></p>
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family: 'Montserrat',Arial,sans-serif; height: 16px;' height='16"></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
        `,
      };
      sgMail.send(msg).then(
        () => {
          // res.json({ msg: "success" });
        },
        (error) => {
          console.log(error);
          res.send(`<script>alert("Failed to send code.");</script>`);
        }
      );

      // 알림
      const alarmDesc = `Congrats. You're now an official member of CHARTIN.`;
      const alarmNewsroomLink = `${routes.newsRoom}/detail/621e1055bb4d4c5208ff5c10`;
      res.locals.sendAlarm(x._id, alarmDesc, alarmNewsroomLink);
    });
    // =========================================
    res.send(
      `<script>\
        alert("It's been approved.");\
        location.href="${routes.admin}${routes.adminMusician}"\
      </script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getAdminMusicianDetail = async (req, res) => {
  try {
    const {
      params: { musicianID },
    } = req;
    const adminItem = await User.findById(musicianID);
    res.render("admin/adminMusicianDetail", {
      adminNameKo: "Musician Account",
      adminLink: routes.adminMusician,
      adminItem,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// 멤버십 계정 관리
export const adminMembership = async (req, res) => {
  try {
    const {
      query: { searchKey, searchValue, limit },
    } = req;
    let findQuery = { subscription: true };

    // 검색 기능이 있을 경우
    const searchArr = [{ code: "0", title: "userID", value: "userID" }];
    if (searchKey && searchValue) {
      findQuery[`${searchArr[parseInt(searchKey, 10)].value}`] = { $regex: searchValue, $options: "i" };
    }

    const [adminItems, totalCount] = await Promise.all([User.find(findQuery).sort({ createdAt: -1 }).limit(limit).skip(req.skip).exec(), User.countDocuments(findQuery)]);
    const pageCount = Math.ceil(totalCount / limit);
    const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);

    // 엑셀 다운로드용 전체 데이터
    const excelData = await User.find(findQuery).sort({ createdAt: -1 });

    res.render("admin/adminMembership", {
      adminNameKo: "Membership Account",
      adminLink: routes.adminMusician,
      limit: req.query.limit,
      searchKey,
      searchValue,
      limit,
      searchArr,
      adminItems,
      totalCount,
      pageCount,
      pages,
      excelData,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// 전문가 계정관리
export const adminExpert = async (req, res) => {
  try {
    const {
      query: { searchKey, searchValue, limit },
    } = req;
    let findQuery = { $or: [{ role: "expert" }, { role: "expertAwait" }] };
    // 검색 기능이 있을 경우
    const searchArr = [{ code: "0", title: "userID", value: "userID" }];

    if (searchKey && searchValue) {
      findQuery[`${searchArr[parseInt(searchKey, 10)].value}`] = { $regex: searchValue, $options: "i" };
    }

    const [adminItems, totalCount] = await Promise.all([User.find(findQuery).sort({ createdAt: -1 }).limit(limit).skip(req.skip).exec(), User.countDocuments(findQuery)]);
    const pageCount = Math.ceil(totalCount / limit);
    const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);

    // 엑셀 다운로드용 전체 데이터
    const excelData = await User.find(findQuery).sort({ createdAt: -1 });

    res.render("admin/adminExpert", {
      adminNameKo: "Expert Account",
      adminLink: routes.adminExpert,
      searchArr,
      searchKey,
      searchValue,
      limit,
      adminItems,
      totalCount,
      pageCount,
      pages,
      excelData,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const adminExpertApprove = async (req, res) => {
  try {
    const { body } = req;
    await User.updateMany({ _id: { $in: body.expertID } }, { role: "expert" });
    const expert = await User.find({ _id: { $in: body.expertID } });
    // ========================================
    // 관리자가 전문가 승인했을 때
    expert.forEach((x) => {
      const msg = {
        to: x.userID,
        from: "Info@chartinmusic.com",
        subject: "[CHARTIN] Congrats. You're now an official member of CHARTIN. ",
        html: `
  <div role="article" aria-roledescription="email" aria-label="Welcome to PixInvent 👋" lang="en">
    <table style="font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; width: 100%;' width='100%' cellpadding='0' cellspacing='0' role='presentation">
      <tbody>
        <tr>
          <td align="center" style="--bg-opacity: 1; background-color: #eceff1; background-color: rgba(236, 239, 241, var(--bg-opacity)); font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif;' bgcolor='rgba(236, 239, 241, var(--bg-opacity))">
            <table class="sm-w-full" style="font-family: 'Montserrat',Arial,sans-serif; max-width: 600px;' width='600' cellpadding='0' cellspacing='0' role='presentation">
              <tbody>
                <tr>
                  <td class="sm-px-24" align="center" style="font-family: 'Montserrat',Arial,sans-serif; max-width:500px; ">
                    <table style="font-family: 'Montserrat',Arial,sans-serif; width: 100%;' width='100%' cellpadding='0' cellspacing='0' role='presentation background-color: #16151a;">
                      <tbody>
                        <tr>
                          <td class="sm-px-24" style="background-color: #16151a; --bg-opacity: 1; border-radius: 4px; font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; font-size: 14px; line-height: 24px; padding: 48px; text-align: left; --text-opacity: 1; color: #fff; "><a href="https://chartinmusic.com"><img src="https://chartin.s3.ap-northeast-2.amazonaws.com/logo/logo_basic%403x.png" width="155" style="border: 0; max-width: 100%; line-height: 100%; vertical-align: middle; margin-bottom: 30px;"/></a>
                            <p style="font-weight: 600; font-size: 18px; margin-bottom: 0; color: #fff;">Congrats! We've reviewed your bio carefully and decided to move forward. You're now an official member of CHARTIN.</p>
                            <p style="margin: 24px 0;">We only accept 5% to 10% of total applicants, so this means you are one of our few best experts. However, please be aware that any illegal or inappropriate activities can dispel your membership.</p>
                            <p style="margin: 24px 0;">So what to do now: All experts can now view musicians' request <a href="https://www.chartinmusic.com/musician-list" style="font-weight: 600; font-size: 18px; margin-bottom: 0; color: #10eb73;">here</a> and start providing services. If you have any questions, please make a inquiry to our chatbot Dino.</p>
                            <table style="font-family: 'Montserrat',Arial,sans-serif;' cellpadding='0' cellspacing='0' role='presentation">
                              <tbody>
                                <tr>
                                  <td style="mso-padding-alt: 16px 24px; --bg-opacity: 1; background-color: #10eb73; border-radius: 4px; font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif;' bgcolor='rgba(115, 103, 240, var(--bg-opacity))"><a href="https://www.chartinmusic.com" style="display: block; font-weight: 600; font-size: 14px; line-height: 100%; padding: 5px 24px; --text-opacity: 1; color: #ffffff; text-decoration: none; background-color: #10eb73;border-radius: 4px;">CHARTIN →</a></td>
                                </tr>
                              </tbody>
                            </table>
                            <table style="font-family: 'Montserrat',Arial,sans-serif; width: 100%;' width='100%' cellpadding='0' cellspacing='0' role='presentation">
                              <tbody>
                                <tr>
                                  <td style="font-family: 'Montserrat',Arial,sans-serif; padding-top: 32px; padding-bottom: 32px;">
                                    <div style="--bg-opacity: 1; background-color: #eceff1; background-color: rgba(236, 239, 241, var(--bg-opacity)); height: 1px; line-height: 1px;">‌</div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <p style="margin: 0 0 16px;">Thanks, <br/>CHARTIN Team</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family: 'Montserrat',Arial,sans-serif; height: 20px;' height='20"></td>
                        </tr>
                        <tr style="display: flex; flex-direction: column; justify-content:center; align-items: center">
                          <td style="margin-bottom: 20px; font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; font-size: 12px; padding-left: 48px; padding-right: 48px; --text-opacity: 1; color: #eceff1; color: rgba(236, 239, 241, var(--text-opacity));">
                            <p style="--text-opacity: 1; color: #263238; color: rgba(38, 50, 56, var(--text-opacity)); text-align: center;">Use of our service and website is subject to our <a class="hover-underline" href="https://chartinmusic.com/terms-of-use" style="--text-opacity: 1; color: #7367f0; text-decoration: none;">Terms of Use </a>and <a class="hover-underline" href="https://chartinmusic.com/privacy-policy" style="--text-opacity: 1; color: #7367f0; color: rgba(115, 103, 240, var(--text-opacity)); text-decoration: none;">Privacy Policy</a>.</p>
                          </td>
                          <td style="font-family: Montserrat, -apple-system, 'Segoe UI', sans-serif; font-size: 12px; padding-left: 48px; padding-right: 48px; --text-opacity: 1; color: #eceff1; color: rgba(236, 239, 241, var(--text-opacity));">
                            <p style="--text-opacity: 1; color: #263238; color: rgba(38, 50, 56, var(--text-opacity)); text-align: center;">Don't you want to subscribe? <a class="hover-underline" href="https://chartinmusic.com/user/sign-in/unsubscribe" style="--text-opacity: 1; color: #7367f0; text-decoration: none;">Unsubscribe</a></p>
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family: 'Montserrat',Arial,sans-serif; height: 16px;' height='16"></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
        `,
      };
      sgMail.send(msg).then(
        () => {
          // res.json({ msg: "success" });
        },
        (error) => {
          console.log(error);
          res.send(`<script>alert("Failed to send code.");</script>`);
        }
      );

      // 알림
      const alarmDesc = `Congrats. You're now an official member of CHARTIN.`;
      const alarmNewsroomLink = `${routes.newsRoom}/detail/621e1096bb4d4c5208ff5c20`;
      res.locals.sendAlarm(x._id, alarmDesc, alarmNewsroomLink);
    });
    // =========================================
    res.send(
      `<script>\
        alert("It's been approved.");\
        location.href="${routes.admin}${routes.adminExpert}"\
      </script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getAdminExpertDetail = async (req, res) => {
  try {
    const {
      params: { expertID },
    } = req;
    const adminItem = await User.findById(expertID);
    res.render("admin/adminExpertDetail", {
      adminNameKo: "Expert Account",
      adminLink: routes.adminExpert,
      adminItem,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// 차단 계정 관리
export const adminBlockedAccount = async (req, res) => {
  try {
    const {
      query: { limit },
    } = req;

    const [adminItems, totalCount] = await Promise.all([BlockList.find().sort({ createdAt: -1 }).limit(limit).skip(req.skip).exec(), BlockList.countDocuments()]);
    const pageCount = Math.ceil(totalCount / limit);
    const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);

    res.render("admin/adminBlockedAccount", {
      adminNameKo: "Blocked Account",
      adminLink: routes.adminBlockedAccount,
      limit,
      adminItems,
      totalCount,
      pageCount,
      pages,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// HYPE - 메인 영상 관리
export const adminMainVideo = async (req, res) => {
  try {
    const {
      query: { limit },
    } = req;

    let findQuery = {};

    // pagination 데이터
    const [adminItems, totalCount] = await Promise.all([
      MainVideo.find(findQuery).populate("expertID").sort({ createdAt: -1 }).limit(limit).skip(req.skip).exec(),
      MainVideo.countDocuments(findQuery),
    ]);
    const pageCount = Math.ceil(totalCount / limit);
    const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);

    res.render("admin/adminMainVideo", {
      adminNameKo: "Main Videos",
      adminLink: routes.adminMainVideo,
      limit,
      adminItems,
      totalCount,
      pageCount,
      pages,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getCreateMainVideo = async (_, res) => {
  try {
    const experts = await User.find({ role: "expert" });
    res.render("admin/adminMainVideoForm", {
      adminNameKo: "Main Videos",
      adminLink: routes.adminMainVideo,
      updateBool: false,
      formType: "등록",
      experts,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postCreateMainVideo = async (req, res) => {
  try {
    const { body } = req;

    body.createdAt = moment(new Date()).tz("Asia/Seoul");
    body.updatedAt = moment(new Date()).tz("Asia/Seoul");
    const expertID = await User.findOne({ userID: body.userID });
    body.expertID = expertID._id;

    await MainVideo.create(body);

    res.send(`\
      <script>alert("It's been created.");\
      location.href="${routes.admin}${routes.adminMainVideo}";</script>\
    `);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getMainVideoDetail = async (req, res) => {
  try {
    const {
      params: { mainVideoID },
    } = req;
    const adminItem = await MainVideo.findById(mainVideoID).populate("expertID");
    res.render("admin/adminMainVideoDetail", {
      adminNameKo: "Main Videos",
      adminLink: routes.adminMainVideo,
      adminItem,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getUpdateMainVideo = async (req, res) => {
  try {
    const {
      params: { mainVideoID },
    } = req;
    const adminItem = await MainVideo.findById(mainVideoID).populate("expertID");
    const experts = await User.find({ role: "expert" });
    res.render("admin/adminMainVideoForm", {
      adminNameKo: "Main Videos",
      adminLink: routes.adminMainVideo,
      updateBool: true,
      formType: "수정",
      adminItem,
      experts,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postUpdateMainVideo = async (req, res) => {
  try {
    const {
      params: { mainVideoID },
      body,
    } = req;
    const mainVideo = await MainVideo.findById(mainVideoID).populate("expertID");
    const expert = await User.findOne({ userID: body.userID });
    body.thumbnail = body.thumbnail ? body.thumbnail : mainVideo.thumbnail;
    body.updatedAt = moment(new Date()).tz("Asia/Seoul");
    await MainVideo.findByIdAndUpdate(mainVideoID, { $pull: { expertID: mainVideo.expertID[0]._id } });
    await MainVideo.findByIdAndUpdate(mainVideoID, { $push: { expertID: expert._id } });
    await MainVideo.findByIdAndUpdate(mainVideoID, body);
    res.send(
      `<script>alert("Updated.");\
      location.href="${routes.admin}${routes.adminMainVideo}"</script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// HYPE - M/W 영상 관리
export const adminMostVideo = async (req, res) => {
  try {
    const {
      query: { limit },
    } = req;

    let findQuery = {};

    // pagination 데이터
    const [adminItems, totalCount] = await Promise.all([
      MostVideo.find(findQuery).populate("expertID").sort({ createdAt: -1 }).limit(limit).skip(req.skip).exec(),
      MostVideo.countDocuments(findQuery),
    ]);
    const pageCount = Math.ceil(totalCount / limit);
    const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);

    res.render("admin/adminMostVideo", {
      adminNameKo: "M/W",
      adminLink: routes.adminMostVideo,
      limit,
      adminItems,
      totalCount,
      pageCount,
      pages,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getCreateMostVideo = async (_, res) => {
  try {
    const experts = await User.find({ role: "expert" });
    res.render("admin/adminMostVideoForm", {
      adminNameKo: "M/W",
      adminLink: routes.adminMostVideo,
      updateBool: false,
      formType: "등록",
      experts,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postCreateMostVideo = async (req, res) => {
  try {
    const { body } = req;
    body.status = body.status === "on" ? true : false;
    body.createdAt = moment(new Date()).tz("Asia/Seoul");
    body.updatedAt = moment(new Date()).tz("Asia/Seoul");
    const expertID = await User.findOne({ userID: body.userID });
    body.expertID = expertID._id;

    await MostVideo.create(body);

    res.send(`\
      <script>alert("It's been created.");\
      location.href="${routes.admin}${routes.adminMostVideo}";</script>\
    `);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getMostVideoDetail = async (req, res) => {
  try {
    const {
      params: { mostVideoID },
    } = req;
    const adminItem = await MostVideo.findById(mostVideoID).populate("expertID");
    res.render("admin/adminMostVideoDetail", {
      adminNameKo: "M/W",
      adminLink: routes.adminMostVideo,
      adminItem,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getUpdateMostVideo = async (req, res) => {
  try {
    const {
      params: { mostVideoID },
    } = req;
    const adminItem = await MostVideo.findById(mostVideoID).populate("expertID");
    const experts = await User.find({ role: "expert" });
    res.render("admin/adminMostVideoForm", {
      adminNameKo: "M/W",
      adminLink: routes.adminMostVideo,
      updateBool: true,
      formType: "Edit",
      adminItem,
      experts,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postUpdateMostVideo = async (req, res) => {
  try {
    const {
      params: { mostVideoID },
      body,
    } = req;

    const mostVideo = await MostVideo.findById(mostVideoID).populate("expertID");
    const expert = await User.findOne({ userID: body.userID });
    body.status = body.status === "on" ? true : false;
    body.thumbnail = body.thumbnail ? body.thumbnail : mostVideo.thumbnail;
    body.updatedAt = moment(new Date()).tz("Asia/Seoul");
    await MostVideo.findByIdAndUpdate(mostVideoID, { $pull: { expertID: mostVideo.expertID[0]._id } });
    await MostVideo.findByIdAndUpdate(mostVideoID, { $push: { expertID: expert._id } }, { new: true });
    await MostVideo.findByIdAndUpdate(mostVideoID, body);
    res.send(
      `<script>alert("Updated.");\
      location.href="${routes.admin}${routes.adminMostVideo}"</script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getDeleteMostVideo = async (req, res) => {
  try {
    const {
      params: { mostVideoID },
    } = req;
    await MostVideo.findByIdAndDelete(mostVideoID);
    res.send(
      `<script>alert("It's been deleted.");\
      location.href="${routes.admin}${routes.adminMostVideo}"</script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// HYPE - 파트너 로고 관리
export const adminPartnerLogo = async (req, res) => {
  try {
    const {
      query: { limit },
    } = req;

    let findQuery = {};

    // pagination 데이터
    const [adminItems, totalCount] = await Promise.all([PartnerLogo.find(findQuery).sort({ createdAt: -1 }).limit(limit).skip(req.skip).exec(), PartnerLogo.countDocuments(findQuery)]);
    const pageCount = Math.ceil(totalCount / limit);
    const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);

    res.render("admin/adminPartnerLogo", {
      adminNameKo: "Partner Logo",
      adminLink: routes.adminPartnerLogo,
      limit,
      adminItems,
      totalCount,
      pageCount,
      pages,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getCreatePartnerLogo = (_, res) => {
  try {
    res.render("admin/adminPartnerLogoForm", {
      adminNameKo: "파트너 로고",
      adminLink: routes.adminPartnerLogo,
      updateBool: false,
      formType: "등록",
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postCreatePartnerLogo = async (req, res) => {
  try {
    const { body } = req;
    body.createdAt = moment(new Date()).tz("Asia/Seoul");
    body.updatedAt = moment(new Date()).tz("Asia/Seoul");
    await PartnerLogo.create(body);

    res.send(`\
      <script>alert("파트너 로고가 등록되었습니다.");\
      location.href="${routes.admin}${routes.adminPartnerLogo}";</script>\
    `);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getPartnerLogoDetail = async (req, res) => {
  try {
    const {
      params: { partnerLogoID },
    } = req;
    const adminItem = await PartnerLogo.findById(partnerLogoID);
    res.render("admin/adminPartnerLogoDetail", {
      adminNameKo: "Partner Logo",
      adminLink: routes.adminPartnerLogo,
      adminItem,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getUpdatePartnerLogo = async (req, res) => {
  try {
    const {
      params: { partnerLogoID },
    } = req;
    const adminItem = await PartnerLogo.findById(partnerLogoID);
    res.render("admin/adminPartnerLogoForm", {
      adminNameKo: "파트너 로고",
      adminLink: routes.adminPartnerLogo,
      updateBool: true,
      formType: "수정",
      adminItem,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postUpdatePartnerLogo = async (req, res) => {
  try {
    const {
      params: { partnerLogoID },
      body,
    } = req;
    const partnerLogo = await PartnerLogo.findById(partnerLogoID);
    body.img = body.img ? body.img : partnerLogo.img;
    body.updatedAt = moment(new Date()).tz("Asia/Seoul");
    await PartnerLogo.findByIdAndUpdate(partnerLogoID, body);
    res.send(
      `<script>alert("파트너 로고가 수정되었습니다.");\
      location.href="${routes.admin}${routes.adminPartnerLogo}"</script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getDeletePartnerLogo = async (req, res) => {
  try {
    const {
      params: { partnerLogoID },
    } = req;
    await PartnerLogo.findByIdAndDelete(partnerLogoID);
    res.send(
      `<script>alert("파트너 로고가 삭제되었습니다.");\
      location.href="${routes.admin}${routes.adminPartnerLogo}"</script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

export const adminConferenceRoom = async (req, res) => {
  try {
    const {
      query: { searchKey, searchValue, limit },
    } = req;

    let findQuery = {};

    // 검색 기능이 있을 경우
    const searchArr = [{ code: "0", title: "Title", value: "title" }];
    if (searchKey && searchValue) {
      findQuery[`${searchArr[parseInt(searchKey, 10)].value}`] = { $regex: searchValue, $options: "i" };
    }

    // pagination 데이터
    const [adminItems, totalCount] = await Promise.all([
      Conference.find(findQuery).populate("userID").sort({ createdAt: -1 }).limit(limit).skip(req.skip).exec(),
      Conference.countDocuments(findQuery),
    ]);
    const pageCount = Math.ceil(totalCount / limit);
    const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);

    // 엑셀 다운로드용 전체 데이터
    const excelData = await Conference.find(findQuery).populate("userID").sort({ createdAt: -1 });

    res.render("admin/adminConferenceRoom", {
      adminNameKo: "Conference",
      adminLink: routes.adminConferenceRoom,
      limit,
      searchArr,
      searchKey,
      searchValue,
      adminItems,
      totalCount,
      pageCount,
      pages,
      excelData,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getConferenceRoomDetail = async (req, res) => {
  try {
    const {
      params: { conferenceID },
    } = req;
    const adminItem = await Conference.findById(conferenceID).populate("userID");
    res.render("admin/adminConferenceRoomDetail", {
      adminNameKo: "Conference",
      adminLink: routes.adminConferenceRoom,
      adminItem,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getDeleteConferenceRoom = async (req, res) => {
  try {
    const {
      params: { conferenceID },
    } = req;
    await Comment.deleteMany({ conferenceID });
    await ConferenceLike.deleteMany({ conferenceID });
    await Conference.findByIdAndDelete(conferenceID);
    res.send(
      `<script>alert("Deleted.");\
      location.href="${routes.admin}${routes.adminConferenceRoom}"</script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// NEWS ROOM - 뉴스 카테고리 관리
export const adminNewsCategory = async (req, res) => {
  try {
    const {
      query: { limit },
    } = req;

    let findQuery = {};

    // pagination 데이터
    const [adminItems, totalCount] = await Promise.all([NewsCategory.find(findQuery).sort({ createdAt: 1 }).limit(limit).skip(req.skip).exec(), NewsCategory.countDocuments(findQuery)]);
    const pageCount = Math.ceil(totalCount / limit);
    const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);

    res.render("admin/adminNewsCategory", {
      adminNameKo: "News Category",
      adminLink: routes.adminNewsCategory,
      limit,
      adminItems,
      totalCount,
      pageCount,
      pages,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getCreateNewsCategory = (_, res) => {
  try {
    res.render("admin/adminNewsCategoryForm", {
      adminNameKo: "News Category",
      adminLink: routes.adminNewsCategory,
      updateBool: false,
      formType: "등록",
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postCreateNewsCategory = async (req, res) => {
  try {
    const { body } = req;

    body.createdAt = moment(new Date()).tz("Asia/Seoul");
    body.updatedAt = moment(new Date()).tz("Asia/Seoul");
    await NewsCategory.create(body);

    res.send(`\
      <script>alert("News category added.");\
      location.href="${routes.admin}${routes.adminNewsCategory}";</script>\
    `);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getUpdateNewsCategory = async (req, res) => {
  try {
    const {
      params: { newsCategoryID },
    } = req;
    const adminItem = await NewsCategory.findById(newsCategoryID);
    res.render("admin/adminNewsCategoryForm", {
      adminNameKo: "News Category",
      adminLink: routes.adminNewsCategory,
      updateBool: true,
      formType: "수정",
      adminItem,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postUpdateNewsCategory = async (req, res) => {
  try {
    const {
      params: { newsCategoryID },
      body,
    } = req;
    body.updatedAt = moment(new Date()).tz("Asia/Seoul");
    await NewsCategory.findByIdAndUpdate(newsCategoryID, body);
    res.send(
      `<script>alert("News category edited.");\
      location.href="${routes.admin}${routes.adminNewsCategory}"</script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getDeleteNewsCategory = async (req, res) => {
  try {
    const {
      params: { newsCategoryID },
    } = req;
    await NewsCategory.findByIdAndDelete(newsCategoryID);
    res.send(
      `<script>alert("News category deleted.");\
      location.href="${routes.admin}${routes.adminNewsCategory}"</script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// NEWS ROOM - 뉴스 컨텐츠 관리
export const adminNewsContents = async (req, res) => {
  try {
    const {
      query: { searchKey, searchValue, limit },
    } = req;

    // 상단 고정 멘탈헬스 튜토리얼 연동링크 제외
    let findQuery = { hide: false };

    // 검색 기능이 있을 경우
    const searchArr = [{ code: "0", title: "제목", value: "title" }];
    if (searchKey && searchValue) {
      findQuery[`${searchArr[parseInt(searchKey, 10)].value}`] = { $regex: searchValue, $options: "i" };
    }

    // pagination 데이터
    const [adminItems, totalCount] = await Promise.all([News.find(findQuery).populate("newsCategoryID").sort({ createdAt: -1 }).limit(limit).skip(req.skip).exec(), News.countDocuments(findQuery)]);
    const pageCount = Math.ceil(totalCount / limit);
    const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);
    // 엑셀 다운로드용 전체 데이터
    const excelData = await News.find().populate("newsCategoryID").sort({ createdAt: -1 });

    // 멘탈 헬스 , 튜토리얼 링크 상단고정
    // 620b4c94a05f05059908c691 = 튜토리얼 , 620b4c3fa05f05059908c683 = 멘탈헬스
    const topNewsContents = await News.find({ hide: true }).populate("newsCategoryID").sort({ createdAt: -1 });
    res.render("admin/adminNewsContents", {
      adminNameKo: "News Content",
      adminLink: routes.adminNewsContents,
      limit,
      searchArr,
      searchKey,
      searchValue,
      adminItems,
      totalCount,
      pageCount,
      pages,
      excelData,
      topNewsContents,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getCreateNewsContents = async (_, res) => {
  try {
    const newsCategories = await NewsCategory.find();
    res.render("admin/adminNewsContentsForm", {
      adminNameKo: "News Content",
      adminLink: routes.adminNewsContents,
      updateBool: false,
      formType: "등록",
      newsCategories,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postCreateNewsContents = async (req, res) => {
  try {
    const { body } = req;
    body.createdAt = moment(new Date()).tz("Asia/Seoul");
    body.updatedAt = moment(new Date()).tz("Asia/Seoul");
    body.hide = body.hide === "on" ? true : false;
    await News.create(body);

    res.send(`\
      <script>alert("Article published.");\
      location.href="${routes.admin}${routes.adminNewsContents}";</script>\
    `);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getNewsContentsDetail = async (req, res) => {
  try {
    const {
      params: { newsID },
    } = req;
    const adminItem = await News.findById(newsID).populate("newsCategoryID");
    res.render("admin/adminNewsContentsDetail", {
      adminNameKo: "News Content",
      adminLink: routes.adminNewsContents,
      adminItem,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getUpdateNewsContents = async (req, res) => {
  try {
    const {
      params: { newsID },
    } = req;
    const newsCategories = await NewsCategory.find({});
    const adminItem = await News.findById(newsID).populate("newsCategoryID");
    res.render("admin/adminNewsContentsForm", {
      adminNameKo: "News Content",
      adminLink: routes.adminNewsContents,
      updateBool: true,
      formType: "수정",
      adminItem,
      newsCategories,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postUpdateNewsContents = async (req, res) => {
  try {
    const {
      params: { newsID },
      body,
    } = req;
    body.updatedAt = moment(new Date()).tz("Asia/Seoul");
    body.hide = body.hide === "on" ? true : false;
    await News.findByIdAndUpdate(newsID, body);
    res.send(
      `<script>alert("Article edited.");\
      location.href="${routes.admin}${routes.adminNewsContents}"</script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getDeleteNewsContents = async (req, res) => {
  try {
    const {
      params: { newsID },
    } = req;
    await News.findByIdAndDelete(newsID);
    res.send(
      `<script>alert("Article deleted.");\
      location.href="${routes.admin}${routes.adminNewsContents}"</script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// GET HIGHER - 미션 관리
export const adminMission = async (req, res) => {
  try {
    const {
      query: { searchKey, searchValue, limit },
    } = req;

    let findQuery = {};

    // 검색 기능이 있을 경우
    const searchArr = [{ code: "0", title: "미션내용", value: "mission" }];
    if (searchKey && searchValue) {
      findQuery[`${searchArr[parseInt(searchKey, 10)].value}`] = { $regex: searchValue, $options: "i" };
    }

    // pagination 데이터
    const [adminItems, totalCount] = await Promise.all([Mission.find(findQuery).sort({ createdAt: 1 }).limit(limit).skip(req.skip).exec(), Mission.countDocuments(findQuery)]);
    const pageCount = Math.ceil(totalCount / limit);
    const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);

    // 엑셀 다운로드용 전체 데이터
    const excelData = await Mission.find(findQuery).sort({ createdAt: -1 });

    res.render("admin/adminMission", {
      adminNameKo: "Mission Management",
      adminLink: routes.adminMission,
      limit,
      searchArr,
      searchKey,
      searchValue,
      adminItems,
      totalCount,
      pageCount,
      pages,
      excelData,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getCreateMission = (_, res) => {
  try {
    res.render("admin/adminMissionForm", {
      adminNameKo: "Mission",
      adminLink: routes.adminMission,
      updateBool: false,
      formType: "등록",
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postCreateMission = async (req, res) => {
  try {
    const { body, file } = req;

    body.imgUrl = file ? file.location : null;
    body.createdAt = moment(new Date()).tz("Asia/Seoul");
    body.updatedAt = moment(new Date()).tz("Asia/Seoul");
    await Mission.create(body);

    res.send(`\
      <script>alert("Mission added.");\
      location.href="${routes.admin}${routes.adminMission}";</script>\
    `);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getUpdateMission = async (req, res) => {
  try {
    const {
      params: { missionID },
    } = req;
    const adminItem = await Mission.findById(missionID);
    res.render("admin/adminMissionForm", {
      adminNameKo: "Mission",
      adminLink: routes.adminMission,
      updateBool: true,
      formType: "수정",
      adminItem,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postUpdateMission = async (req, res) => {
  try {
    const {
      params: { missionID },
      body,
      file,
    } = req;
    const missions = await Mission.findById(missionID);
    body.imgUrl = file ? file.location : missions.imgUrl;
    body.updatedAt = moment(new Date()).tz("Asia/Seoul");
    await Mission.findByIdAndUpdate(missionID, body);
    res.send(
      `<script>alert("Mission edited.");\
      location.href="${routes.admin}${routes.adminMission}"</script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getDeleteMission = async (req, res) => {
  try {
    const {
      params: { missionID },
    } = req;
    await Mission.findByIdAndDelete(missionID);
    res.send(
      `<script>alert("Mission deleted.");\
      location.href="${routes.admin}${routes.adminMission}"</script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// 관리자 월별 정산 관리
export const adminCalculate = async (req, res) => {
  try {
    const {
      // query: { searchKey, searchValue, limit },
      query: { limit },
    } = req;

    // 현재 년-월
    const currentMonth = moment(new Date()).tz("Asia/Seoul").format("YYYY-MM");
    // 월별 검색 시
    let searchByMonth = currentMonth;
    if (req.query.searchByMonth) searchByMonth = req.query.searchByMonth;

    let findQuery = { searchByMonth };

    // 검색 기능이 있을 경우
    // const searchArr = [
    //   { code: "0", title: "데이터1", value: "data1" },
    //   { code: "1", title: "데이터2", value: "data2" },
    //   { code: "2", title: "데이터3", value: "data3" },
    //   { code: "3", title: "데이터4", value: "data4" },
    //   { code: "5", title: "데이터5", value: "data5" },
    // ];
    // if (searchKey && searchValue) {
    //   findQuery[`${searchArr[parseInt(searchKey, 10)].value}`] = { $regex: searchValue, $options: "i" };
    // }

    // pagination 데이터
    const [adminItems, totalCount] = await Promise.all([Save.find(findQuery).populate("expertID").sort({ createdAt: -1 }).limit(limit).skip(req.skip).exec(), Save.countDocuments(findQuery)]);
    const pageCount = Math.ceil(totalCount / limit);
    const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);
    // 엑셀 다운로드용 전체 데이터
    const excelData = await Save.find(findQuery).populate("expertID").sort({ createdAt: -1 });

    res.render("admin/adminCalculate", {
      adminNameKo: "Monthly Withdrawal Application",
      adminLink: routes.adminCalculate,
      // limit,
      // searchArr,
      // searchKey,
      // searchValue,
      adminItems,
      totalCount,
      pageCount,
      pages,
      excelData,
      searchByMonth,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postAdminCalculate = async (req, res) => {
  try {
    const { body } = req;

    await Save.updateMany({ _id: { $in: body.saveID } }, { status: "Completed" });
    const saves = await Save.find({ _id: { $in: body.saveID } }).populate("expertID");

    const expertIDArr = [];
    saves.forEach((x) => {
      expertIDArr.push(x.expertID[0]._id);
    });

    const expertIDs = [];
    expertIDArr.forEach((x) => {
      if (!expertIDs.includes(x)) {
        expertIDs.push(x);
      }
    });
    const users = await User.find({ _id: { $in: expertIDs } });
    users.forEach((x) => {
      // 제목
      const subject = `[CHARTIN] ${x.name}, Your withdrawal request was processed.`;
      // 인사말
      const greetings = `Hello, Thank you for waiting.`;

      const desc = `The 1st of every month is our pay day. We've transferred your requested withdrawal amount to your bank account.
      Our service fee has been applied, but they will be used to attract more musicians whom you can work with and generate even larger revenue in the future.
      Again, thank you for using Chartin service and have a great day!`;

      res.locals.sendEmail(x.userID, subject, greetings, desc);
    });
    res.send(`\
      <script>alert("Withdrawal completed");\
      location.href="${routes.admin}${routes.adminCalculate}";</script>\
    `);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};

// 관리자 샘플 관리
export const adminSample = async (req, res) => {
  try {
    const {
      query: { searchKey, searchValue, limit },
    } = req;

    let findQuery = {};

    // 검색 기능이 있을 경우
    const searchArr = [
      { code: "0", title: "데이터1", value: "data1" },
      { code: "1", title: "데이터2", value: "data2" },
      { code: "2", title: "데이터3", value: "data3" },
      { code: "3", title: "데이터4", value: "data4" },
      { code: "5", title: "데이터5", value: "data5" },
    ];
    if (searchKey && searchValue) {
      findQuery[`${searchArr[parseInt(searchKey, 10)].value}`] = { $regex: searchValue, $options: "i" };
    }

    // pagination 데이터
    const [adminItems, totalCount] = await Promise.all([Sample.find(findQuery).sort({ createdAt: -1 }).limit(limit).skip(req.skip).exec(), Sample.countDocuments(findQuery)]);
    const pageCount = Math.ceil(totalCount / limit);
    const pages = paginate.getArrayPages(req)(10, pageCount, req.query.page);

    // 엑셀 다운로드용 전체 데이터
    const excelData = await Sample.find(findQuery).sort({ createdAt: -1 });

    res.render("admin/adminSample", {
      adminNameKo: "샘플 데이터",
      adminLink: routes.adminSample,
      limit,
      searchArr,
      searchKey,
      searchValue,
      adminItems,
      totalCount,
      pageCount,
      pages,
      excelData,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getCreateSample = (_, res) => {
  try {
    res.render("admin/adminSampleForm", {
      adminNameKo: "샘플 데이터",
      adminLink: routes.adminSample,
      updateBool: false,
      formType: "등록",
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postCreateSample = async (req, res) => {
  try {
    const { body, file } = req;

    body.thumbnail = file ? file.location : null;
    body.createdAt = moment(new Date()).tz("Asia/Seoul");
    body.updatedAt = moment(new Date()).tz("Asia/Seoul");
    await Sample.create(body);

    res.send(`\
      <script>alert("샘플이 등록되었습니다.");\
      location.href="${routes.admin}${routes.adminSample}";</script>\
    `);
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getSampleDetail = async (req, res) => {
  try {
    const {
      params: { sampleID },
    } = req;
    const adminItem = await Sample.findById(sampleID);
    res.render("admin/adminSampleDetail", {
      adminNameKo: "샘플 데이터",
      adminLink: routes.adminSample,
      adminItem,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getUpdateSample = async (req, res) => {
  try {
    const {
      params: { sampleID },
    } = req;
    const adminItem = await Sample.findById(sampleID);
    res.render("admin/adminSampleForm", {
      adminNameKo: "샘플 데이터",
      adminLink: routes.adminSample,
      updateBool: true,
      formType: "수정",
      adminItem,
    });
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const postUpdateSample = async (req, res) => {
  try {
    const {
      params: { sampleID },
      body,
      file,
    } = req;
    const mainVideos = await Sample.findById(sampleID);
    body.thumbnail = file ? file.location : samples.thumbnail;
    body.updatedAt = moment(new Date()).tz("Asia/Seoul");
    await Sample.findByIdAndUpdate(sampleID, body);
    res.send(
      `<script>alert("샘플이 수정되었습니다.");\
      location.href="${routes.admin}${routes.adminSample}"</script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
export const getDeleteSample = async (req, res) => {
  try {
    const {
      params: { sampleID },
    } = req;
    await Sample.findByIdAndDelete(sampleID);
    res.send(
      `<script>alert("샘플이 삭제되었습니다.");\
      location.href="${routes.admin}${routes.adminSample}"</script>`
    );
  } catch (err) {
    console.log(err);
    res.send(
      `<script>alert("An error has occurred.:\\r\\n${err}");\
      location.href="${routes.admin}"</script>`
    );
  }
};
