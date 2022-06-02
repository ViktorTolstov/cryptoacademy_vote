//SPDX-License-Identifier: Unlicense
pragma solidity >=0.7.0 <0.9.0;
import 'hardhat/console.sol';

contract AddElection 
{
    address public Owner;
    address public ContractAddress;

    election[] public CreatedElections;

    struct election {
        address ElectionAddress;
        string Topic;
    }

    function GetElectionNumber() public view returns(uint)
    {
        return CreatedElections.length;
    }

    constructor() 
    {
        Owner = msg.sender;
        ContractAddress = address(this);
    }

    function StartElection(string calldata name) external returns (bool)
    {
        require(Owner == msg.sender, "error: do not enough rights - must be owner");
        Election newElection = new Election(Owner, name );
        
        CreatedElections.push(election({
            ElectionAddress: address(newElection),
            Topic: name
        }));
        
        return true;
    }

    receive() external payable{}
}

contract Election 
{
    address public Owner;
    address public ElectionAddress;
    string public Topic;

    /**
     * @dev It will become true if someone completes the vote
    */
    bool flag;

    uint256 endTime;

    event Paid(address indexed _from, uint indexed _amount);

    mapping(address => bool) AlreadyVoted;

    modifier votingOpen()
    {
        require(block.timestamp <= endTime, "error: elections elready finished");
        _;
    }

    constructor (address _owner, string memory _topic)  
    {
        Owner = _owner;
        ElectionAddress = address(this);
        Topic = _topic;
        endTime = block.timestamp + 259200;
    }

    struct Candidate 
    {
        string name;   
        address candidateAddress; 
        uint voteCount;
    }
    
    Candidate[] public CandidatesList;

    mapping(address => bool) CandidatesMap; 

    function AddCandidate(string calldata _name, address _address) external returns (bool)
    {
        require(Owner == msg.sender, "error: do not enough rights - must be owner");
        require(!CandidatesMap[_address], "error: this candidate already exist");
        
        CandidatesList.push(Candidate({
            name: _name,
            candidateAddress: _address,
            voteCount: 0
        }));

        CandidatesMap[_address] = true;

        return true;
    }

    function Vote(address _address) external payable votingOpen returns (bool)
    {
        uint256 _payment = 10**16;
        
        require(msg.value >= _payment, "error: not enough eth in transaction");
        require(!AlreadyVoted[msg.sender], "error: second attempt to vote");
        require(CandidatesMap[_address], "error: unknown candidate");

        emit Paid(msg.sender, msg.value);
        for (uint i = 0; i < CandidatesList.length; i++)
        {
            if (CandidatesList[i].candidateAddress == _address)
            {
                CandidatesList[i].voteCount++;
            }
        }
        
        AlreadyVoted[msg.sender] = true;

        return true;
    }

    function Finish() external payable returns (bool)
    {
        require( block.timestamp > endTime, "error: elections not over");
        require(!flag, "error: elections already finished");

        address winner = CandidatesList[0].candidateAddress;
        uint maxVoteCount = CandidatesList[0].voteCount;
        for (uint i = 1; i < CandidatesList.length; i++)
        {
            if (CandidatesList[i].voteCount > maxVoteCount)
            {
                winner = CandidatesList[i].candidateAddress;
                maxVoteCount = CandidatesList[i].voteCount;
            }
        }

        uint _money = ElectionAddress.balance * 9 / 10;
        
        payable(winner).transfer(_money);

        flag = true;

        return true;
    }


    function Withdrawal(address payable _to) external payable returns (bool)
    {
        require(Owner == msg.sender, "error: do not enough rights - must be owner");
        require(flag, "error: elections not overcompleted");
        _to.transfer(ElectionAddress.balance);
        return true;
    }

    receive() external payable votingOpen{}
} 