export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/form-builder/index',
    'pages/form-fill/index',
    'pages/form-result/index',
    'pages/dashboard/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#4F46E5',
    navigationBarTitleText: '超级表单',
    navigationBarTextStyle: 'white'
  },
  permission: {
    'scope.userInfo': {
      desc: '获取您的用户信息用于数据追踪'
    }
  }
})
