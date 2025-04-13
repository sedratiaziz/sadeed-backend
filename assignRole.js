const dotenv = require('dotenv');
dotenv.config();
const inquirer = require('inquirer').default;
console.log('inquirer:', inquirer);

const mongoose = require('mongoose');
const User = require('./models/User');



mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log('CLI is Connected to MongoDB!');
});

async function assignRole() {
    const users = await User.find();
  
    const userChoices = users.map((user) => ({
      name: user.username,
      value: user._id,
    }));
  
    const { selectedUser } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedUser',
        message: 'Select a user to assign a role:',
        choices: userChoices,
      },
    ]);
  
    const { role } = await inquirer.prompt([
      {
        type: 'list',
        name: 'role',
        message: 'Select the role to assign:',
        choices: ['engineer', 'manager', 'operational'],
      },
    ]);
  
    const updatedUser = await User.findByIdAndUpdate(
      selectedUser,
      { role },
      { new: true }
    );
  
    console.log(`User ${updatedUser.username} is now assigned the role of ${role}`);
    process.exit();
  }
  

assignRole().catch((err) => {
  console.error(err);
  process.exit(1);
});
