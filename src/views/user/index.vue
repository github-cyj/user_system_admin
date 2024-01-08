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
      <el-table-column label="ID" prop="id" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="头像" align="center" width="100">
        <template slot-scope="{row}">
          <img v-if="row.avatar" :src="getAvatarUrl(row.avatar)" width="50" height="50">
          <i v-else class="el-icon-user" style="font-size: 50px;" />
        </template>
      </el-table-column>
      <el-table-column label="用户名">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改" align="center">
        <template slot-scope="{row}">
          <span>{{ row.update_time }}</span>
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
  </div>
</template>

<style lang="scss">
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
import { getUserList, getUserInfo, updateUser, createUser, deleteUser } from '@/api/user'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'UserTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      avatarUploadUrl: process.env.VUE_APP_BASE_API + '/api/file/upload_single',
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
        username: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '用户编辑',
        create: '用户创建'
      },
      rules: {
        username: [{ required: true, message: '用户名必须填写', trigger: 'change' }]
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

        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },

    resetUserInfo() {
      this.userInfo = {
        id: undefined,
        avatar: '',
        username: ''
      }
    },
    getAvatarUrl(avatarUrl) {
      return process.env.VUE_APP_BASE_API + '/' + avatarUrl
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
              this.$notify({
                title: '成功',
                message: '添加成功',
                type: 'success',
                duration: 2000
              })
            } else {
              this.$notify({
                title: '错误',
                message: response.msg,
                type: 'error',
                duration: 2000
              })
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
          this.$notify({
            title: '错误',
            message: response.msg,
            type: 'error',
            duration: 2000
          })
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
              this.$notify({
                title: '成功',
                message: '修改成功',
                type: 'success',
                duration: 2000
              })
            } else {
              this.$notify({
                title: '错误',
                message: response.msg,
                type: 'error',
                duration: 2000
              })
            }
          })
        }
      })
    },
    handleDelete(row) {
      deleteUser(row.id).then(response => {
        if (response.code === 200) {
          this.getList()
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        } else {
          this.$notify({
            title: '错误',
            message: response.msg,
            type: 'error',
            duration: 2000
          })
        }
      })
    },
    handleAvatarSuccess(res, file) {
      if (res.code === 200) {
        this.userInfo.avatar = res.data
      } else {
        this.$notify({
          title: '图片上传错误错误',
          message: res.msg,
          type: 'error',
          duration: 2000
        })
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
    }

  }
}
</script>

