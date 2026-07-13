const STORAGE_KEY = 'heartnotes-users'

export async function getUsers() {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : []
}

export async function createUser(userData: any) {
  await new Promise(r => setTimeout(r, 200))
  const saved = localStorage.getItem(STORAGE_KEY)
  const users = saved ? JSON.parse(saved) : []
  if (users.some((u: any) => u.name === userData.name)) {
    return users.find((u: any) => u.name === userData.name)
  }
  const newUser = { id: Date.now(), name: userData.name, icon: userData.icon }
  users.push(newUser)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  return newUser
}

export async function updateUser(id: number, userData: any) {
  await new Promise(r => setTimeout(r, 200))
  const saved = localStorage.getItem(STORAGE_KEY)
  const users = saved ? JSON.parse(saved) : []
  const index = users.findIndex((u: any) => u.id === id)
  if (index === -1) throw new Error('User not found')
  users[index] = { ...users[index], ...userData }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  return users[index]
}

export async function deleteUser(id: number) {
  await new Promise(r => setTimeout(r, 200))
  const saved = localStorage.getItem(STORAGE_KEY)
  const users = saved ? JSON.parse(saved) : []
  const filtered = users.filter((u: any) => u.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

export function saveUsers(users: any[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  return true
}

export default { getUsers, createUser, updateUser, deleteUser, saveUsers }
