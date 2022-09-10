import React from 'react'
import '../styles/AccManagement.css'

const AccManagement = () =>  {

    return (
        <div class="main">
          <div className="add-btn">
                Add User
            </div>
          <table class="content-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Authority</th>
                    <th>Claims</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>A</td>
                    <td>Mahasiswa</td>
                    <td>Authority</td>
                    <td>Claim</td>
                    <td>
                      <button type="button" class="act-btn edit-btn"><i class="fas fa-edit"></i></button>
                      <button type="button" class="act-btn del-btn"><i class="fa fa-trash"></i></button>
                    </td>
                  </tr>
                  <tr>
                    <td>B</td>
                    <td>Dosen</td>
                    <td>Authority</td>
                    <td>Claim</td>
                    <td>
                      <button type="button" class="act-btn edit-btn"><i class="fas fa-edit"></i></button>
                      <button type="button" class="act-btn del-btn"><i class="fa fa-trash"></i></button>
                    </td>
                  </tr>
                </tbody>
          </table>

                
           
        </div>
    )
}

export default AccManagement
