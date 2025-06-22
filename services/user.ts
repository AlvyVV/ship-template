import { CreditsAmount, CreditsTransType } from './credit'
import { findUserByEmail, findUserByUuid, insertUser } from '@/models/user'

import { User } from '@/types/user'
import { getOneYearLaterTimestr } from '@/lib/time'
import { getUserUuidByApiKey } from '@/models/apikey'
import { headers } from 'next/headers'
import { increaseCredits } from './credit'

export async function saveUser(user: User) {
  try {
    const existUser = await findUserByEmail(user.email)
    if (!existUser) {
      await insertUser(user)

      // increase credits for new user, expire in one year
      await increaseCredits({
        userUuid: user.uuid || '',
        transType: CreditsTransType.NewUser,
        credits: CreditsAmount.NewUserGet,
        expiredAt: getOneYearLaterTimestr(),
      })
    } else {
      user.id = existUser.id
      user.uuid = existUser.uuid
      user.createdAt = existUser.createdAt
    }

    return user
  } catch (e) {
    console.log('save user failed: ', e)
    throw e
  }
}

export async function getUserUuid() {
  let userUuid = ''

  const token = await getBearerToken()

  if (token) {
    // api key
    if (token.startsWith('sk-')) {
      const userUuid = await getUserUuidByApiKey(token)

      return userUuid || ''
    }
  }

  return userUuid
}

export async function getBearerToken() {
  const h = await headers()
  const auth = h.get('Authorization')
  if (!auth) {
    return ''
  }

  return auth.replace('Bearer ', '')
}

export async function getUserEmail() {
  let userEmail = ''

  return userEmail
}

export async function getUserInfo() {
  let userUuid = await getUserUuid()

  if (!userUuid) {
    return
  }

  const user = await findUserByUuid(userUuid)

  return user
}
