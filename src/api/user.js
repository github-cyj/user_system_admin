import request from '@/utils/request'

export function getUserList(params) {
  return request({
    url: '/api/user',
    method: 'get',
    params: params
  })
}

export function getUserInfo(id) {
  return request({
    url: '/api/user/' + id,
    method: 'get'
  })
}

export function updateUser(id, data) {
  return request({
    url: '/api/user/' + id,
    method: 'put',
    data: data
  })
}

export function createUser(data) {
  return request({
    url: '/api/user',
    method: 'post',
    data: data
  })
}

export function deleteUser(id) {
  return request({
    url: '/api/user/' + id,
    method: 'delete'
  })
}
