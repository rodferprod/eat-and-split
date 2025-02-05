import { useState } from "react";

const initialFriends = [
	{
		id: 118836,
		name: "Clark",
		image: "https://i.pravatar.cc/48?u=118836",
		balance: -7,
	},
	{
		id: 933372,
		name: "Sarah",
		image: "https://i.pravatar.cc/48?u=933372",
		balance: 20,
	},
	{
		id: 499476,
		name: "Anthony",
		image: "https://i.pravatar.cc/48?u=499476",
		balance: 0,
	},
];

export default function App() {
	// Handle to show and hide the form to add new friend to the list
	const [showAddFriend, setShowAddFriend] = useState(false);
	// Handle the list of friends and the inclusion of a new friend
	const [friends, setFriends] = useState(initialFriends);
	// Handle the selected friend to split a bill
	const [selectedFriend, setSelectedFriend] = useState(null);

	function handleShowAddFriend() {
		// "show" parameter is actually "showAddFriend" state value
		// In this case we're just toggle between true and false
		setShowAddFriend((show) => !show);
		// If we're adding a new friend let's unselect anyone that is selected
		// It'll hide the split the bill form too
		setSelectedFriend(null);
	}

	function handleSetFriends(friend) {
		setFriends((actFriends) => [...actFriends, friend]);
		// After adding a new friend to the list
		// let's hide the add new friend form
		setShowAddFriend(false);
	}

	function handleSelectFriend(friend) {
		// We want to select a friend to split the bill, but we want to toggle the visualization
		// of the form to split the bill when unselect a friend. When we click on Select button
		// the label of the button changes to Close. So, if we click in the same friend we'll
		// set the state to null otherwise set a friend. Because that we need to check if
		// selectedFriend have the id property with the optional chaining operator too.
		setSelectedFriend((currentSelected) =>
			friend.id === selectedFriend?.id ? null : friend
		);
		// After select a friend the form to split the bill will be shown, so
		// we need to ensure that the form to add a new friend stay hidden if,
		// for some reason, it's not hidden
		setShowAddFriend(false);
	}

	/**
	 * In this hypothetical app, just one person of two will pay the entire value of the bill: You or your friend
	 * But, a value will be defined to be your responsible to pay and the difference between the bill value will be responsible by your friend to pay you later.
	 * So, if you're paying the entire bill the value of the balance will be positive otherwise will be negative, because your friend will pay the bill and you'll owe him the value assigned to you.
	 */
	function handleSplitBill(value) {
		console.log(value);

		// Now, we need to update the friends list with the new balance of the friend you're spliting the bill
		setFriends((friends) =>
			friends.map((friend) =>
				selectedFriend.id === friend.id
					? { ...friend, balance: friend.balance + value }
					: friend
			)
		);
		// After split the bill we need to hide the form unselecting the friend
		setSelectedFriend(null);
	}

	return (
		<div className="app">
			<div className="sidebar">
				<FriendsList
					friends={friends}
					onSelectFriend={handleSelectFriend}
					selectedFriend={selectedFriend}
				/>

				{/* We'll show the form to add friend just after a button click */}
				{showAddFriend && (
					<FormAddFriend onAddFriend={handleSetFriends} />
				)}
				<Button handleClick={handleShowAddFriend}>
					{showAddFriend ? "Close" : "Add friend"}
				</Button>
			</div>

			{/* We'll show the form to split a bill just after select a friend,
                but we have to make this component unic between each friend.
                It's because when we fill up the form for one friend and then select nother friend,
                all the information filled will be keept.
                To fix that we just need to include an unique key prop. Problem solved.
            */}
			{selectedFriend && (
				<FormSplitBill
					key={selectedFriend.id}
					selectedFriend={selectedFriend}
					onSplitBill={handleSplitBill}
				/>
			)}
		</div>
	);
}

function Button({ children, handleClick }) {
	return (
		<button className="button" onClick={handleClick}>
			{children}
		</button>
	);
}

function FriendsList({ friends, onSelectFriend, selectedFriend }) {
	return (
		<ul>
			{friends.map((friend) => (
				<Friend
					friend={friend}
					key={friend.id}
					onSelectFriend={onSelectFriend}
					selectedFriend={selectedFriend}
				/>
			))}
		</ul>
	);
}

function Friend({ friend, onSelectFriend, selectedFriend }) {
	// Define what's the current selected friend of the list
	// But, we need to check if selectedFriend have an id property
	// using the optional chaining because the initial state is null
	const isSelected = friend.id === selectedFriend?.id;
	return (
		<>
			<li className={isSelected ? "selected" : ""}>
				<img src={friend.image} alt={friend.name} />
				<h3>{friend.name}</h3>
				{friend.balance < 0 && (
					<p className="red">
						You owe {friend.name} {Math.abs(friend.balance)}$
					</p>
				)}
				{friend.balance > 0 && (
					<p className="green">
						{friend.name} owes you {Math.abs(friend.balance)}$
					</p>
				)}
				{friend.balance === 0 && <p>You and {friend.name} are even</p>}
				<Button handleClick={() => onSelectFriend(friend)}>
					{!isSelected ? "Select" : "Close"}
				</Button>
			</li>
		</>
	);
}

function FormAddFriend({ onAddFriend }) {
	const [name, setName] = useState("");
	const [image, setImage] = useState("https://i.pravatar.cc/48");

	function handleSubmit(ev) {
		ev.preventDefault();

		if (!name || !image) {
			return;
		}

		const id = crypto.randomUUID();

		const newFriend = {
			name,
			image: `${image}?u=${id}`,
			balance: 0,
			id: crypto.randomUUID(),
		};

		onAddFriend(newFriend);

		setName("");
		setImage("https://i.pravatar.cc/48");
	}

	return (
		<form className="form-add-friend" onSubmit={handleSubmit}>
			<label>🕺 Friend name</label>
			<input
				type="text"
				value={name}
				onChange={(ev) => setName(ev.target.value)}
			/>

			<label>🖼 Image URL</label>
			<input
				type="text"
				value={image}
				onChange={(ev) => setImage(ev.target.value)}
			/>

			<Button>Add</Button>
		</form>
	);
}

function FormSplitBill({ selectedFriend, onSplitBill }) {
	// Even if we use a number input to write the values of bill and paidByUser fields
	// we need to ensure that this values are converted to numbers
	const [bill, setBill] = useState("");
	const [paidByUser, setPaidByUser] = useState("");
	// To calculate the value that a friend will pay we need to check if the
	// value of the bill was informed to not generate an error
	const paidByFriend = bill ? bill - paidByUser : "";

	const [whoIsPaying, setWhoIsPaying] = useState("user");

	const handleSubmit = (ev) => {
		ev.preventDefault();
		// Checking if the values are filled
		if (!bill || !paidByUser) return;

		// The rule is: If you're paying the bill, the balance will be a positive number represented by the value assigned to your friend
		// But, if your friend is paying the balance will a be negative number represented by the value assigned to you.
		onSplitBill(whoIsPaying === "user" ? paidByFriend : -paidByUser);
	};
	return (
		<form className="form-split-bill" onSubmit={handleSubmit}>
			<h2>Split a bill with {selectedFriend.name}</h2>

			<label>💲 Bill value</label>
			<input
				type="number"
				value={bill}
				onChange={(ev) => setBill(Number(ev.target.value))}
			/>
			{/**
			 * The value that will be paid by the user can't be greater than the bill value
			 */}
			<label>👤 Your expense</label>
			<input
				type="number"
				value={paidByUser}
				onChange={(ev) =>
					setPaidByUser(
						Number(ev.target.value) > bill
							? paidByUser
							: Number(ev.target.value)
					)
				}
			/>

			<label>🕺 {selectedFriend.name}'s expense</label>
			<input type="text" value={paidByFriend} disabled />

			<label>🤑 who is paying the bill?</label>
			<select
				value={whoIsPaying}
				onChange={(ev) => setWhoIsPaying(ev.target.value)}
			>
				<option value="user">You</option>
				<option value="friend">{selectedFriend.name}</option>
			</select>

			<Button>Split the bill</Button>
		</form>
	);
}
