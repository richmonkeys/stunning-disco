import path from 'path'
import fs from 'fs'

const resolveFile = (...pathRelativeToRoot: string[]) => {
  const absolutePath = path.resolve('./', ...pathRelativeToRoot)

  return fs.readFileSync(absolutePath)
}

export const resolveDir = (...pathRelativeToRoot: string[]) => {
  const absolutePath = path.resolve('./', ...pathRelativeToRoot)

  const filenames = fs.readdirSync(absolutePath)

  return filenames.map(name => path.join('/', ...pathRelativeToRoot, name))
}

export default resolveFile