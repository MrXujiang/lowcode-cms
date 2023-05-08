import { Reducer, Effect } from 'umi'

export interface UsersModelState {
  userConfig: any
}

interface UsersModelType {
  namespace: 'users'
  state: UsersModelState
  effects: {
    // upload: Effect,
  }
  reducers: {
    setUserConfig: Reducer,
  }
}

const ViewsModel: UsersModelType = {
  namespace: 'users',
  state: {
    userConfig: {},
  },
  effects: {
    // *save({ payload }, { call, put }) {
    //   yield put({ type: 'startLoading' })
    //   const res = yield call(save, payload)
    //   yield put({ type: 'closeLoading' })
    //   return res || {}
    // },
  },
  reducers: {
    'setUserConfig'(state, { paylod }) {
      return { ...state, userConfig: paylod }
    }
  },
}

export default ViewsModel
