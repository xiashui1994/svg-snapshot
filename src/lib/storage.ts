import { Storage } from "@plasmohq/storage"

/**
 * 存储
 */
export const storage = (options?: any) => {
  return new Storage(options)
}

/**
 * 存储数据
 */
export const setStorage = async (key, value) => {
  return await storage().set(key, value)
}

/**
 * 获取数据
 */
export const getStorage = async (key) => {
  return await storage().get(key)
}

/**
 * 监听数据变化
 */
export const watchStorage = (options) => {
  return storage().watch(options)
}
