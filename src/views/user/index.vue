<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      :border="true"
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="头像" align="center" width="100">
        <template slot-scope="{row}">
          <img v-if="row.avatar" :src="getAvatarUrl(row.avatar)" width="30" height="30" min-width="150">
          <i v-else class="el-icon-user" style="font-size: 30px;" />
        </template>
      </el-table-column>
      <el-table-column label="用户名" header-align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" width="80" align="center">
        <template slot-scope="{row}">
          <span>{{ row.sex == 1 ? '男' : '女' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" align="center" min-width="150">
        <template slot-scope="{row}">
          <span>{{ row.tel }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" align="center" min-width="200">
        <template slot-scope="{row}">
          <span>{{ row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" min-width="180">
        <template slot-scope="{row}">
          <span>{{ row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status != 'deleted'" size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
          <el-button type="warning" size="mini" @click="handlePassword(row)">
            修改密码
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="userForm"
        :rules="rules"
        :model="userInfo"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="头像" prop="avatar">
          <el-upload
            class="avatar-uploader"
            :action="avatarUploadUrl"
            :headers="avatarUploadHeader"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :multiple="false"
            name="files"
          >
            <div v-if="userInfo.avatar">
              <img :src="getAvatarUrl(userInfo.avatar)" class="avatar">
            </div>
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userInfo.username" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio v-model="userInfo.sex" :label="1">男</el-radio>
          <el-radio v-model="userInfo.sex" :label="2">女</el-radio>
        </el-form-item>
        <el-form-item label="手机号" prop="tel">
          <el-input v-model="userInfo.tel" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userInfo.email" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改密码" :visible.sync="dialogPasswordVisible">
      <el-form
        ref="passwordForm"
        :rules="password_rules"
        label-position="left"
        label-width="80px"
        :model="passwordInfo"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="原密码" prop="old_password">
          <el-input ref="old_password" v-model="passwordInfo.old_password" :type="oldPasswordType" placeholder="请输入原密码" />
          <span class="show-pwd" @click="showPwd('oldPasswordType', 'old_password')">
            <svg-icon :icon-class="oldPasswordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
        <el-form-item label="新密码" prop="new_password">
          <el-input ref="new_password" v-model="passwordInfo.new_password" :type="newPasswordType" placeholder="请输入新密码" />
          <span class="show-pwd" @click="showPwd('newPasswordType', 'new_password')">
            <svg-icon :icon-class="newPasswordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
        <el-form-item label="确认密码" prop="repeat_password">
          <el-input
            ref="repeat_password"
            v-model="passwordInfo.repeat_password"
            :type="repeatPasswordType"
            placeholder="请再次输入新密码"
          />
          <span class="show-pwd" @click="showPwd('repeatPasswordType', 'repeat_password')">
            <svg-icon :icon-class="repeatPasswordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updatePassword">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss">
.show-pwd {
  position: absolute;
  right: 10px;
  font-size: 16px;
  color: #889aa4;
  cursor: pointer;
  user-select: none;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>

<script>
import { getUserList, getUserInfo, updateUser, createUser, deleteUser, updatePassword } from '@/api/user'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { getToken } from '@/utils/auth'
export default {
  name: 'UserTable',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      avatarUploadUrl: process.env.VUE_APP_BASE_API + '/api/file/upload_single',
      avatarUploadHeader: {
        'X-Token': getToken()
      },
      tableKey: 'UserTable',
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      },
      userInfo: {
        id: undefined,
        avatar: '',
        username: '',
        sex: 1,
        email: '',
        tel: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '用户编辑',
        create: '用户创建'
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'change' }],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        tel: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: '^1\\d{10}$', message: '请输入正确的手机号', trigger: ['blur', 'change'] }
        ],
        sex: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ]
      },
      dialogPasswordVisible: false,
      oldPasswordType: 'password',
      newPasswordType: 'password',
      repeatPasswordType: 'password',
      passwordInfo: {
        id: undefined,
        old_password: '',
        new_password: '',
        repeat_password: ''
      },
      password_rules: {
        old_password: [{ required: true, message: '请输入旧密码', trigger: ['blur', 'change'] }],
        new_password: [{ required: true, message: '请输入新密码', trigger: ['blur', 'change'] }],
        repeat_password: [{ required: true, message: '请输入确认密码', trigger: ['blur', 'change'] }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getUserList(this.listQuery).then(response => {
        this.list = response.data.data
        this.total = response.data.total
        this.listLoading = false
      })
    },

    resetUserInfo() {
      this.userInfo = {
        id: undefined,
        avatar: '',
        username: '',
        sex: 1,
        email: '',
        tel: ''
      }
    },
    getAvatarUrl(url) {
      var pattern = new RegExp('^(http|https):\/\/')
      if (pattern.test(url)) {
        return url
      } else {
        return process.env.VUE_APP_BASE_API + '/' + url
      }
    },

    handleCreate() {
      this.resetUserInfo()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['userForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['userForm'].validate((valid) => {
        if (valid) {
          createUser(this.userInfo).then(response => {
            if (response.code === 200) {
              this.getList()
              this.dialogFormVisible = false
              this.$message.success('添加成功')
            } else {
              this.$message.error(response.msg)
            }
          })
        }
      })
    },
    handleUpdate(row) {
      getUserInfo(row.id).then(response => {
        if (response.code === 200) {
          this.userInfo = Object.assign({}, response.data)
          this.dialogStatus = 'update'
          this.dialogFormVisible = true
          this.$nextTick(() => {
            this.$refs['userForm'].clearValidate()
          })
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    updateData() {
      this.$refs['userForm'].validate((valid) => {
        if (valid) {
          updateUser(this.userInfo.id, this.userInfo).then(response => {
            if (response.code === 200) {
              this.getList()
              this.dialogFormVisible = false
              this.$message.success('修改成功')
            } else {
              this.$message.error(response.msg)
            }
          })
        }
      })
    },
    handleDelete(row) {
      deleteUser(row.id).then(response => {
        if (response.code === 200) {
          this.getList()
          this.$message.success('删除成功')
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    handleAvatarSuccess(res, file) {
      if (res.code === 200) {
        this.userInfo.avatar = res.data
      } else {
        this.$message.error(res.msg)
      }
    },
    beforeAvatarUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.$message.error('上传头像非图片格式')
      }
      if (!isLt5M) {
        this.$message.error('上传头像图片大小不能超过 5MB!')
      }
      return isImage && isLt5M
    },
    resetPasswordInfo() {
      this.oldPasswordType = 'password'
      this.newPasswordType = 'password'
      this.repeatPasswordType = 'password'
      this.passwordInfo = {
        id: undefined,
        oldPassword: '',
        newPassword: '',
        repeatPassword: ''
      }
    },
    handlePassword(row) {
      this.resetPasswordInfo()
      this.passwordInfo.id = row.id
      this.dialogPasswordVisible = true
      this.$nextTick(() => {
        this.$refs['passwordForm'].clearValidate()
      })
    },
    updatePassword() {
      this.$refs['passwordForm'].validate((valid) => {
        if (valid) {
          updatePassword(this.passwordInfo.id, this.passwordInfo).then(response => {
            if (response.code === 200) {
              this.dialogPasswordVisible = false
              this.$message.success('密码修改成功')
            } else {
              this.$message.error(response.msg)
            }
          })
        }
      })
    },
    showPwd(passwordType, name) {
      console.log(this, this[passwordType])
      if (this[passwordType] === 'password') {
        this[passwordType] = ''
      } else {
        this[passwordType] = 'password'
      }
      this.$nextTick(() => {
        this.$refs[name].focus()
      })
    }
  }
}
</script>

